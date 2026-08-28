import type { UserId } from '@/types';
import { getDatabase } from './database';

export const clearUserWorkoutHistory = async (userId: UserId): Promise<void> => {
  const database = await getDatabase();
  const transaction = database.transaction(
    ['workoutSessions', 'exerciseProgress'],
    'readwrite',
  );
  const sessionStore = transaction.objectStore('workoutSessions');
  const progressStore = transaction.objectStore('exerciseProgress');

  const [sessionKeys, progressKeys] = await Promise.all([
    sessionStore.index('by-user').getAllKeys(userId),
    progressStore.index('by-user').getAllKeys(userId),
  ]);

  await Promise.all([
    ...sessionKeys.map((key) => sessionStore.delete(key)),
    ...progressKeys.map((key) => progressStore.delete(key)),
  ]);
  await transaction.done;
};
