import { api } from './api';
import type { Profile } from '../types/database';

export async function getProfile(userId: string): Promise<Profile | null> {
  const rows = await api.get<Profile[]>(`profiles?id=eq.${userId}&select=*`);
  return rows[0] ?? null;
}

export async function updateProfile(
  userId: string,
  patch: Partial<Pick<Profile, 'full_name'>>
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