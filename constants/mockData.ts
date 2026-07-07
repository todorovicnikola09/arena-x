export const CATEGORIES = ['All', 'PUBG', 'CS2', 'LoL', 'Valorant', 'Dota 2'];

export const AVATAR_COLORS = [
  '#8B5CF6', '#3B82F6', '#10B981', '#F97316',
  '#EC4899', '#06B6D4', '#F59E0B', '#EF4444',
];

export type PlayerStatus = 'accepted' | 'pending';

export interface Player {
  id: string;
  initials: string;
  name: string;
  rank?: string;
  status: PlayerStatus;
}

export interface TournamentMock {
  id: string;
  name: string;
  game: string;
  status: 'live' | 'open' | 'closed' | 'finished';
  prizePool: string;
  formatTags: string[];
  rounds: string;
  date: string;
  isOnline: boolean;
  location?: string;
  coverImage: string;
  maxParticipants: number;
  filledCount: number;
  rules: string[];
  players: Player[];
}

export const FEATURED_TOURNAMENT: TournamentMock = {
  id: 'pubg-continental-series',
  name: 'PUBG Continental Series',
  game: 'PUBG',
  status: 'live',
  prizePool: '$10,000',
  formatTags: ['Battle Royale', 'Squad (4v4)'],
  rounds: '5 Matches',
  date: 'Jul 12, 2026',
  isOnline: true,
  coverImage:
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
  maxParticipants: 16,
  filledCount: 14,
  rules: [
    'Standard PUBG battle royale ruleset applies',
    'No teaming outside of assigned squads',
    'Points based on kills + placement (WWCD)',
    'Anti-cheat software required at check-in',
  ],
  players: [
    { id: '1', initials: 'SK', name: 'ShadowKill', status: 'accepted' },
    { id: '2', initials: 'NV', name: 'NightViper', status: 'accepted' },
    { id: '3', initials: 'XR', name: 'xReaper99', rank: 'Master', status: 'pending' },
    { id: '4', initials: 'CG', name: 'CyberGhost', rank: 'Diamond', status: 'pending' },
    { id: '5', initials: 'PA', name: 'PhantomAce', status: 'accepted' },
    { id: '6', initials: 'VS', name: 'VoidStriker', rank: 'Platinum', status: 'pending' },
    { id: '7', initials: 'IC', name: 'IronClad_X', status: 'accepted' },
    { id: '8', initials: 'SB', name: 'StormBreaker', status: 'pending' },
    { id: '9', initials: 'LP', name: 'LunaticPro', status: 'accepted' },
    { id: '10', initials: 'DM', name: 'DeathMark', rank: 'Platinum', status: 'pending' },
    { id: '11', initials: 'NS', name: 'NovaStar', status: 'accepted' },
    { id: '12', initials: 'BR', name: 'BladeRunner', rank: 'Master', status: 'pending' },
  ],
};

export const UPCOMING_TOURNAMENTS: TournamentMock[] = [
  {
    id: 'cs2-global-offensive-cup',
    name: 'CS2 Global Offensive Cup',
    game: 'CS2',
    status: 'open',
    prizePool: '$4,000',
    formatTags: ['5v5'],
    rounds: '3 Matches',
    date: 'Jul 18, 2026',
    isOnline: false,
    location: 'Berlin, DE',
    coverImage:
      'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800&q=80',
    maxParticipants: 16,
    filledCount: 8,
    rules: ['Standard CS2 competitive ruleset', 'Best of 3 per matchup'],
    players: [],
  },
  {
    id: 'league-of-legends-clash',
    name: 'League of Legends Clash',
    game: 'LoL',
    status: 'open',
    prizePool: '$2,500',
    formatTags: ['5v5'],
    rounds: '4 Matches',
    date: 'Jul 22, 2026',
    isOnline: true,
    coverImage:
      'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800&q=80',
    maxParticipants: 20,
    filledCount: 12,
    rules: ['Standard Summoner\u2019s Rift ruleset'],
    players: [],
  },
  {
    id: 'valorant-champions-open',
    name: 'Valorant Champions Open',
    game: 'Valorant',
    status: 'open',
    prizePool: '$5,000',
    formatTags: ['5v5'],
    rounds: '5 Matches',
    date: 'Jul 28, 2026',
    isOnline: true,
    coverImage:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
    maxParticipants: 16,
    filledCount: 3,
    rules: ['Standard Valorant competitive ruleset'],
    players: [],
  },
];

export const ALL_TOURNAMENTS: TournamentMock[] = [
  FEATURED_TOURNAMENT,
  ...UPCOMING_TOURNAMENTS,
];

export function getTournamentById(id: string) {
  return ALL_TOURNAMENTS.find((t) => t.id === id);
}

export const DASHBOARD_STATS = {
  total: 12,
  accepted: 6,
  pending: 5,
  fillRate: 38,
  coOrganizersCount: 2,
};