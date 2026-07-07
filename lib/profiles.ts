import { api } from './api';
import type { Profile, PlayerRank } from '../types/database';

export async function getProfile(userId: string): Promise<Profile | null> {
  const rows = await api.get<Profile[]>(`profiles?id=eq.${userId}&select=*`);
  return rows[0] ?? null;
}

export async function updateProfile(
  userId: string,
  patch: Partial<Pick<Profile, 'full_name' | 'username' | 'rank'>>
): Promise<Profile> {
  const rows = await api.patch<Profile[]>(`profiles?id=eq.${userId}`, patch);
  return rows[0];
}

export async function findProfileByEmail(email: string): Promise<Profile | null> {
  const rows = await api.get<Profile[]>(
    `profiles?email=eq.${encodeURIComponent(email)}&select=*`
  );
  return rows[0] ?? null;
}

export async function findProfileByUsername(username: string): Promise<Profile | null> {
  const rows = await api.get<Profile[]>(
    `profiles?username=eq.${encodeURIComponent(username)}&select=*`
  );
  return rows[0] ?? null;
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const existing = await findProfileByUsername(username);
  return existing === null;
}

export const PLAYER_RANKS: PlayerRank[] = [
  'Bronze',
  'Silver',
  'Gold',
  'Platinum',
  'Diamond',
  'Master',
];

export async function searchProfilesByUsername(query: string, excludeId?: string): Promise<Profile[]> {
  if (!query.trim()) return [];
  const rows = await api.get<Profile[]>(
    'profiles?username=ilike.*' + encodeURIComponent(query.trim()) + '*&select=*&limit=8'
  );
  return excludeId ? rows.filter((p) => p.id !== excludeId) : rows;
}