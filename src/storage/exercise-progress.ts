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
