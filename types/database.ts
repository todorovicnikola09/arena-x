export type TournamentStatus = 'open' | 'closed' | 'finished';
export type OrganizerRole = 'owner' | 'co_organizer';
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

export interface Tournament {
  id: string;
  name: string;
  game: string;
  date: string;
  is_online: boolean;
  location: string | null;
  cover_image_url: string | null;
  max_participants: number;
  status: TournamentStatus;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface TournamentOrganizer {
  id: string;
  tournament_id: string;
  profile_id: string;
  role: OrganizerRole;
  created_at: string;
  profiles?: Profile;
}

export interface Application {
  id: string;
  tournament_id: string;
  user_id: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  tournaments?: Tournament;
}

export interface TournamentWithMeta extends Tournament {
  organizers?: TournamentOrganizer[];
  accepted_count?: number;
}