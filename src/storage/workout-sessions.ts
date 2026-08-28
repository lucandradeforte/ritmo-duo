import type { UserId, WorkoutSession } from '@/types';
import { getDatabase } from './database';

interface WorkoutSessionQuery {
  userId?: UserId;
  limit?: number;
  includeDiscarded?: boolean;
}

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
