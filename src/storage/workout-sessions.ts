import type { UserId, WorkoutSession } from '@/types';
import { getDatabase } from './database';

export interface WorkoutSessionQuery {
  userId?: UserId;
  limit?: number;
  includeDiscarded?: boolean;
}

export const saveWorkoutSession = async (session: WorkoutSession): Promise<void> => {
  const database = await getDatabase();
  await database.put('workoutSessions', session);
};

export const getWorkoutSession = async (sessionId: string): Promise<WorkoutSession | undefined> => {
  const database = await getDatabase();
  return database.get('workoutSessions', sessionId);
};

export const getPreviousExerciseSets = async (
  userId: UserId,
  exerciseId: string,
  before = Date.now(),
) => {
  const sessions = await listWorkoutSessions({ userId });
  const previousExercise = sessions
    .filter((session) => session.status === 'completed' && session.startedAt < before)
    .flatMap((session) => session.exercises)
    .find((exercise) => exercise.exerciseId === exerciseId && !exercise.skipped);

  return previousExercise?.sets ?? [];
};

export const listWorkoutSessions = async (
  query: WorkoutSessionQuery = {},
): Promise<WorkoutSession[]> => {
  const database = await getDatabase();
  const sessions = query.userId
    ? await database.getAllFromIndex('workoutSessions', 'by-user', query.userId)
    : await database.getAll('workoutSessions');

  const sorted = sessions
    .filter((session) => query.includeDiscarded || session.status !== 'discarded')
    .sort((left, right) => right.startedAt - left.startedAt);

  return typeof query.limit === 'number' ? sorted.slice(0, Math.max(0, query.limit)) : sorted;
};

export const deleteWorkoutSession = async (sessionId: string): Promise<void> => {
  const database = await getDatabase();
  await database.delete('workoutSessions', sessionId);
};

export const clearWorkoutHistory = async (userId?: UserId): Promise<number> => {
  const database = await getDatabase();
  const transaction = database.transaction('workoutSessions', 'readwrite');
  const sessions = userId
    ? await transaction.store.index('by-user').getAll(userId)
    : await transaction.store.getAll();

  await Promise.all(sessions.map((session) => transaction.store.delete(session.id)));
  await transaction.done;
  return sessions.length;
};
