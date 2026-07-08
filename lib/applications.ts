import { api } from './api';
import type { Application, ApplicationStatus, Tournament } from '../types/database';

export async function getMyApplication(
  tournamentId: string,
  userId: string
): Promise<Application | null> {
  const rows = await api.get<Application[]>(
    'applications?tournament_id=eq.' + tournamentId + '&user_id=eq.' + userId + '&select=*'
  );
  return rows[0] ?? null;
}

export async function applyToTournament(
  tournamentId: string,
  userId: string
): Promise<Application> {
  const rows = await api.post<Application[]>('applications', {
    tournament_id: tournamentId,
    user_id: userId,
    status: 'pending',
  });
  return rows[0];
}

export async function getApplicationsForTournament(
  tournamentId: string
): Promise<Application[]> {
  return api.get<Application[]>(
    'applications?tournament_id=eq.' + tournamentId + '&select=*,profiles(*)'
  );
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus
): Promise<Application> {
  const rows = await api.patch<Application[]>(
    'applications?id=eq.' + applicationId,
    { status }
  );
  return rows[0];
}


export interface MyApplicationRow extends Omit<Application, 'tournaments'> {
  tournaments: Tournament | Tournament[] | null;
}

export async function getMyApplications(userId: string): Promise<MyApplicationRow[]> {
  return api.get<MyApplicationRow[]>(
    'applications?user_id=eq.' + userId + '&select=*,tournaments(*)&order=created_at.desc'
  );
}

export async function cancelApplication(applicationId: string): Promise<void> {
  await api.delete('applications?id=eq.' + applicationId);
}