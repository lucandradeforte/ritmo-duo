import type { AppPreferences } from '@/types';
import { createDefaultPreferences, getDatabase } from './database';

export type PreferencesPatch = Partial<Omit<AppPreferences, 'id' | 'updatedAt'>>;

export const getPreferences = async (): Promise<AppPreferences> => {
  const database = await getDatabase();
  return (await database.get('preferences', 'app')) ?? createDefaultPreferences();
};

export const savePreferences = async (preferences: AppPreferences): Promise<void> => {
  const database = await getDatabase();
  await database.put('preferences', preferences);
};

export const updatePreferences = async (
  patch: PreferencesPatch,
  now = Date.now(),
): Promise<AppPreferences> => {
  const database = await getDatabase();
  const transaction = database.transaction('preferences', 'readwrite');
  const current = (await transaction.store.get('app')) ?? createDefaultPreferences(now);
  const next: AppPreferences = { ...current, ...patch, id: 'app', updatedAt: now };
  await transaction.store.put(next);
  await transaction.done;
  return next;
};

export const resetPreferences = async (now = Date.now()): Promise<AppPreferences> => {
  const next = createDefaultPreferences(now);
  await savePreferences(next);
  return next;
};
