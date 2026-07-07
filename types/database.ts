
export type TournamentStatus = 'open' | 'closed' | 'finished';
export type OrganizerRole = 'owner' | 'co_organizer';
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected';
export type PlayerRank = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  rank: PlayerRank;
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
  prize_pool: number | null;
  game_mode: string | null;
  team_format: string | null;
  rules: string | null;
  is_live: boolean;
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