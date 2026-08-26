import { users as defaultUsers } from '@/data/users';
import type { UserId, UserProfile } from '@/types';
import { getDatabase } from './database';

export const listUserProfiles = async (): Promise<UserProfile[]> => {
  const database = await getDatabase();
  const storedProfiles = await database.getAll('users');
  const profilesById = new Map(storedProfiles.map((profile) => [profile.id, profile]));
  return defaultUsers.flatMap((profile) => {
    const stored = profilesById.get(profile.id);
    return stored ? [stored] : [];
  });
};

export const getUserProfile = async (userId: UserId): Promise<UserProfile | undefined> => {
  const database = await getDatabase();
  return database.get('users', userId);
};

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  const database = await getDatabase();
  await database.put('users', profile);
};

export const restoreDefaultUserProfiles = async (): Promise<void> => {
  const database = await getDatabase();
  const transaction = database.transaction('users', 'readwrite');
  await transaction.store.clear();
  await Promise.all(defaultUsers.map((profile) => transaction.store.put(profile)));
  await transaction.done;
};
