import { api } from './api';
import type { Tournament, TournamentStatus } from '../types/database';
import type { CreateTournamentState } from '../context/CreateTournamentContext';

interface CreateTournamentPayload {
  name: string;
  game: string;
  date: string;
  is_online: boolean;
  location: string | null;
  max_participants: number;
  owner_id: string;
  prize_pool: number | null;
  rules: string | null;
}

export async function createTournament(payload: CreateTournamentPayload): Promise<Tournament> {
  const rows = await api.post<Tournament[]>('tournaments', payload);
  return rows[0];
}

export async function addCoOrganizer(tournamentId: string, profileId: string) {
  return api.post(
    'tournament_organizers',
    { tournament_id: tournamentId, profile_id: profileId, role: 'co_organizer' },
    { returnRepresentation: false }
  );
}

export function combineDateAndTime(date: string, time: string): string {
  if (!date) return new Date().toISOString();

  let year: string, month: string, day: string;
  if (date.includes('-')) {
    [year, month, day] = date.split('-');
  } else {
    [day, month, year] = date.split('.');
  }

  const [hours = '00', minutes = '00'] = (time || '').split(':');
  const iso = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes)
  );
  return iso.toISOString();
}

export async function publishTournament(
  form: CreateTournamentState,
  ownerId: string
): Promise<Tournament> {
  const tournament = await createTournament({
    name: form.name.trim(),
    game: form.game,
    date: combineDateAndTime(form.date, form.time),
    is_online: form.locationType === 'online',
    location: form.locationType === 'offline' ? form.location.trim() || null : null,
    max_participants: form.maxParticipants,
    owner_id: ownerId,
    prize_pool: form.prizePool.trim() ? Number(form.prizePool) : null,
    rules: form.rules.trim() || null,
  });

  for (const coOrg of form.coOrganizers) {
    await addCoOrganizer(tournament.id, coOrg.id);
  }

  if (form.coverImageUri) {
    try {
      const { uploadTournamentCover } = await import('./storage');
      const publicUrl = await uploadTournamentCover(form.coverImageUri, tournament.id);
      await updateTournament(tournament.id, { cover_image_url: publicUrl });
      tournament.cover_image_url = publicUrl;
    } catch (err) {
      console.warn('Cover image upload failed:', err);
    }
  }

  return tournament;
}

export async function getOpenTournaments(): Promise<Tournament[]> {
  return api.get<Tournament[]>('tournaments?status=eq.open&select=*&order=date.asc');
}

export async function getAllVisibleTournaments(): Promise<Tournament[]> {
  return api.get<Tournament[]>('tournaments?select=*&order=date.asc');
}

export async function getTournamentById(id: string): Promise<Tournament | null> {
  const rows = await api.get<Tournament[]>('tournaments?id=eq.' + id + '&select=*');
  return rows[0] ?? null;
}

export async function getAcceptedCount(tournamentId: string): Promise<number> {
  const result = await api.post<number>('rpc/get_accepted_count', {
    p_tournament_id: tournamentId,
  });
  return result ?? 0;
}

export async function checkIsOrganizer(tournamentId: string, profileId: string): Promise<boolean> {
  const rows = await api.get<{ id: string }[]>(
    'tournament_organizers?tournament_id=eq.' + tournamentId + '&profile_id=eq.' + profileId + '&select=id'
  );
  return rows.length > 0;
}

export interface ManagedTournament extends Tournament {
  my_role: 'owner' | 'co_organizer';
}

interface OrganizerJoinRow {
  tournament_id: string;
  role: 'owner' | 'co_organizer';
  tournaments: Tournament | Tournament[] | null;
}

export async function getTournamentsManagedByUser(
  profileId: string
): Promise<ManagedTournament[]> {
  const organizerRows = await api.get<OrganizerJoinRow[]>(
    'tournament_organizers?profile_id=eq.' + profileId + '&select=tournament_id,role,tournaments(*)'
  );

  const result: ManagedTournament[] = [];

  for (const row of organizerRows) {
    const tournament: Tournament | null = Array.isArray(row.tournaments)
      ? row.tournaments[0] ?? null
      : row.tournaments;

    if (tournament) {
      result.push({ ...tournament, my_role: row.role });
    }
  }

  return result.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export interface TournamentUpdatePatch {
  name?: string;
  game?: string;
  date?: string;
  is_online?: boolean;
  location?: string | null;
  max_participants?: number;
  prize_pool?: number | null;
  game_mode?: string | null;
  team_format?: string | null;
  rules?: string | null;
  status?: TournamentStatus;
  cover_image_url?: string | null;
}

export async function updateTournament(
  tournamentId: string,
  patch: TournamentUpdatePatch
): Promise<Tournament> {
  const rows = await api.patch<Tournament[]>('tournaments?id=eq.' + tournamentId, patch);
  return rows[0];
}

export async function closeApplications(tournamentId: string): Promise<Tournament> {
  return updateTournament(tournamentId, { status: 'closed' });
}

export async function deleteTournament(tournamentId: string): Promise<void> {
  await api.delete('tournaments?id=eq.' + tournamentId);
}