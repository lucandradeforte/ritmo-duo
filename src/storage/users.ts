import { users as defaultUsers } from '@/data/users';
import type { UserProfile } from '@/types';
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
