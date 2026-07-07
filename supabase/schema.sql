
-- ------------------------------------------------------------
-- Extensions
-- ------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- Tables
-- ------------------------------------------------------------

-- profiles: one row per auth user, created automatically on signup
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  username text,
  rank text not null default 'Bronze' check (rank in ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master')),
  created_at timestamptz not null default now()
);

-- username is optional at the DB level (nullable) but must be unique when set,
-- so existing rows created before this column existed don't break
create unique index if not exists idx_profiles_username on public.profiles (username) where username is not null;

-- tournaments
create table if not exists public.tournaments (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  game text not null,
  date timestamptz not null,
  is_online boolean not null default false,
  location text,
  cover_image_url text,
  max_participants integer not null check (max_participants > 0),
  status text not null default 'open' check (status in ('open', 'closed', 'finished')),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  prize_pool numeric,
  game_mode text,
  team_format text,
  rules text,
  is_live boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- tournament_organizers: owner row is auto-inserted by trigger below,
-- co-organizer rows are inserted by the owner via the app
create table if not exists public.tournament_organizers (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('owner', 'co_organizer')),
  created_at timestamptz not null default now(),
  unique (tournament_id, profile_id)
);

-- applications
create table if not exists public.applications (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tournament_id, user_id)
);

-- Helpful indexes
create index if not exists idx_tournaments_status on public.tournaments (status);
create index if not exists idx_tournaments_game on public.tournaments (game);
create index if not exists idx_tournament_organizers_tournament on public.tournament_organizers (tournament_id);
create index if not exists idx_tournament_organizers_profile on public.tournament_organizers (profile_id);
create index if not exists idx_applications_tournament on public.applications (tournament_id);
create index if not exists idx_applications_user on public.applications (user_id);

-- ------------------------------------------------------------
-- Triggers
-- ------------------------------------------------------------

-- 1) Auto-create a profiles row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, username)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'username'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2) Auto-insert an 'owner' row in tournament_organizers when a tournament is created
create or replace function public.handle_new_tournament()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.tournament_organizers (tournament_id, profile_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$;

drop trigger if exists on_tournament_created on public.tournaments;
create trigger on_tournament_created
  after insert on public.tournaments
  for each row execute procedure public.handle_new_tournament();

-- 3) Auto-close tournament once accepted applications reach max_participants
--    (nice-to-have per spec; app logic also handles this on accept)
create or replace function public.handle_application_accept()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  accepted_count integer;
  max_count integer;
begin
  if new.status = 'accepted' and (old.status is distinct from 'accepted') then
    select max_participants into max_count from public.tournaments where id = new.tournament_id;
    select count(*) into accepted_count from public.applications
      where tournament_id = new.tournament_id and status = 'accepted';
    if accepted_count >= max_count then
      update public.tournaments set status = 'closed', updated_at = now()
        where id = new.tournament_id and status = 'open';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_application_accepted on public.applications;
create trigger on_application_accepted
  after update on public.applications
  for each row execute procedure public.handle_application_accept();

-- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_tournaments on public.tournaments;
create trigger set_updated_at_tournaments
  before update on public.tournaments
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_applications on public.applications;
create trigger set_updated_at_applications
  before update on public.applications
  for each row execute procedure public.set_updated_at();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_organizers enable row level security;
alter table public.applications enable row level security;

-- ---------- profiles ----------
drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true); -- names/emails of organizers & applicants need to be visible in-app

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());

-- ---------- tournaments ----------
drop policy if exists "tournaments_select_open_or_managed" on public.tournaments;
create policy "tournaments_select_open_or_managed"
  on public.tournaments for select
  to authenticated
  using (
    status = 'open'
    or owner_id = auth.uid()
    or exists (
      select 1 from public.tournament_organizers t_org
      where t_org.tournament_id = tournaments.id
        and t_org.profile_id = auth.uid()
    )
  );

drop policy if exists "tournaments_insert_own" on public.tournaments;
create policy "tournaments_insert_own"
  on public.tournaments for insert
  to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "tournaments_update_organizers" on public.tournaments;
create policy "tournaments_update_organizers"
  on public.tournaments for update
  to authenticated
  using (
    exists (
      select 1 from public.tournament_organizers t_org
      where t_org.tournament_id = tournaments.id
        and t_org.profile_id = auth.uid()
        and t_org.role in ('owner', 'co_organizer')
    )
  );

drop policy if exists "tournaments_delete_owner" on public.tournaments;
create policy "tournaments_delete_owner"
  on public.tournaments for delete
  to authenticated
  using (owner_id = auth.uid());

-- ---------- tournament_organizers ----------
drop policy if exists "organizers_select_related" on public.tournament_organizers;
create policy "organizers_select_related"
  on public.tournament_organizers for select
  to authenticated
  using (
    profile_id = auth.uid()
    or exists (
      select 1 from public.tournaments t
      where t.id = tournament_organizers.tournament_id
        and t.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.tournament_organizers self_org
      where self_org.tournament_id = tournament_organizers.tournament_id
        and self_org.profile_id = auth.uid()
    )
  );

-- Only the tournament owner may add new organizer rows (co-organizers).
-- The owner's own row is inserted by the trigger (security definer), not by this policy.
drop policy if exists "organizers_insert_owner_only" on public.tournament_organizers;
create policy "organizers_insert_owner_only"
  on public.tournament_organizers for insert
  to authenticated
  with check (
    role = 'co_organizer'
    and exists (
      select 1 from public.tournaments t
      where t.id = tournament_organizers.tournament_id
        and t.owner_id = auth.uid()
    )
  );

drop policy if exists "organizers_delete_owner_only" on public.tournament_organizers;
create policy "organizers_delete_owner_only"
  on public.tournament_organizers for delete
  to authenticated
  using (
    role = 'co_organizer'
    and exists (
      select 1 from public.tournaments t
      where t.id = tournament_organizers.tournament_id
        and t.owner_id = auth.uid()
    )
  );

-- ---------- applications ----------
drop policy if exists "applications_select_own_or_managed" on public.applications;
create policy "applications_select_own_or_managed"
  on public.applications for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.tournament_organizers t_org
      where t_org.tournament_id = applications.tournament_id
        and t_org.profile_id = auth.uid()
    )
  );

drop policy if exists "applications_insert_own" on public.applications;
create policy "applications_insert_own"
  on public.applications for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.tournaments t
      where t.id = applications.tournament_id
        and t.status = 'open'
    )
  );

-- Users cannot update their own application status; only organizers/co-organizers can.
drop policy if exists "applications_update_organizers_only" on public.applications;
create policy "applications_update_organizers_only"
  on public.applications for update
  to authenticated
  using (
    exists (
      select 1 from public.tournament_organizers t_org
      where t_org.tournament_id = applications.tournament_id
        and t_org.profile_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- Storage bucket for tournament cover images (optional feature)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('tournament-covers', 'tournament-covers', true)
on conflict (id) do nothing;

drop policy if exists "tournament_covers_public_read" on storage.objects;
create policy "tournament_covers_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'tournament-covers');

drop policy if exists "tournament_covers_auth_upload" on storage.objects;
create policy "tournament_covers_auth_upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'tournament-covers');

drop policy if exists "tournament_covers_owner_update" on storage.objects;
create policy "tournament_covers_owner_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'tournament-covers' and owner = auth.uid());

drop policy if exists "tournament_covers_owner_delete" on storage.objects;
create policy "tournament_covers_owner_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'tournament-covers' and owner = auth.uid());

-- ------------------------------------------------------------
-- Migration: new profile/tournament fields for the redesigned UI
-- (safe to run even if you already ran this file once before —
--  ADD COLUMN IF NOT EXISTS is a no-op when the column already exists)
-- ------------------------------------------------------------
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists rank text not null default 'Bronze';
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_rank_check'
  ) then
    alter table public.profiles add constraint profiles_rank_check
      check (rank in ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master'));
  end if;
end $$;
create unique index if not exists idx_profiles_username on public.profiles (username) where username is not null;

alter table public.tournaments add column if not exists prize_pool numeric;
alter table public.tournaments add column if not exists game_mode text;
alter table public.tournaments add column if not exists team_format text;
alter table public.tournaments add column if not exists rules text;
alter table public.tournaments add column if not exists is_live boolean not null default false;