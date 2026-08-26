import type { ExerciseProgressRecord, UserId } from '@/types';
import { getDatabase } from './database';

export const exerciseProgressId = (userId: UserId, exerciseId: string): string =>
  `${userId}:${exerciseId}`;

export const getExerciseProgress = async (
  userId: UserId,
  exerciseId: string,
): Promise<ExerciseProgressRecord | undefined> => {
  const database = await getDatabase();
  return database.get('exerciseProgress', exerciseProgressId(userId, exerciseId));
};

export const listExerciseProgress = async (
  userId?: UserId,
): Promise<ExerciseProgressRecord[]> => {
  const database = await getDatabase();
  return userId
    ? database.getAllFromIndex('exerciseProgress', 'by-user', userId)
    : database.getAll('exerciseProgress');
};

export const saveExerciseProgress = async (
  progress: ExerciseProgressRecord,
): Promise<void> => {
  const database = await getDatabase();
  await database.put('exerciseProgress', {
    ...progress,
    id: exerciseProgressId(progress.userId, progress.exerciseId),
  });
};

export const clearExerciseProgress = async (userId?: UserId): Promise<number> => {
  const database = await getDatabase();
  const transaction = database.transaction('exerciseProgress', 'readwrite');
  const records = userId
    ? await transaction.store.index('by-user').getAll(userId)
    : await transaction.store.getAll();
  await Promise.all(records.map((record) => transaction.store.delete(record.id)));
  await transaction.done;
  return records.length;
};
