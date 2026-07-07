import React, { createContext, useContext, useState } from 'react';
import type { Profile } from '../types/database';

export type CoOrganizerEntry = Pick<Profile, 'id' | 'username' | 'full_name'>;

export interface CreateTournamentState {
  name: string;
  game: string;
  date: string;
  time: string;
  locationType: 'online' | 'offline';
  location: string;
  maxParticipants: number;
  coOrganizers: CoOrganizerEntry[];
  coverImageUri: string | null;
  prizePool: string;
  rules: string;
}

const DEFAULT_STATE: CreateTournamentState = {
  name: '',
  game: 'PUBG',
  date: '',
  time: '',
  locationType: 'online',
  location: '',
  maxParticipants: 16,
  coOrganizers: [],
  coverImageUri: null,
  prizePool: '',
  rules: '',
};

interface CreateTournamentContextValue {
  form: CreateTournamentState;
  update: (patch: Partial<CreateTournamentState>) => void;
  addCoOrganizer: (profile: CoOrganizerEntry) => void;
  removeCoOrganizer: (id: string) => void;
  reset: () => void;
}

const CreateTournamentContext = createContext<CreateTournamentContextValue | undefined>(undefined);

export function CreateTournamentProvider({ children }: { children: React.ReactNode }) {
  const [form, setForm] = useState<CreateTournamentState>(DEFAULT_STATE);

  const update = (patch: Partial<CreateTournamentState>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const addCoOrganizer = (profile: CoOrganizerEntry) =>
    setForm((prev) => {
      if (prev.coOrganizers.some((c) => c.id === profile.id)) return prev;
      return { ...prev, coOrganizers: [...prev.coOrganizers, profile] };
    });

  const removeCoOrganizer = (id: string) =>
    setForm((prev) => ({
      ...prev,
      coOrganizers: prev.coOrganizers.filter((c) => c.id !== id),
    }));

  const reset = () => setForm(DEFAULT_STATE);

  return (
    <CreateTournamentContext.Provider
      value={{ form, update, addCoOrganizer, removeCoOrganizer, reset }}
    >
      {children}
    </CreateTournamentContext.Provider>
  );
}

export function useCreateTournament() {
  const ctx = useContext(CreateTournamentContext);
  if (!ctx) throw new Error('useCreateTournament must be used within CreateTournamentProvider');
  return ctx;
}