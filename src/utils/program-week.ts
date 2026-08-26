import type { UserId, WorkoutSession } from '@/types';
import { MAX_PROGRAM_WEEK, MIN_PROGRAM_WEEK } from './training-phase';

export const COMPLETED_SESSIONS_PER_PROGRAM_WEEK = 3;
export const INACTIVITY_RESET_DAYS = 14;

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1_000;
const INACTIVITY_RESET_MILLISECONDS = INACTIVITY_RESET_DAYS * MILLISECONDS_PER_DAY;

const getCompletionTimestamp = (session: WorkoutSession): number =>
  session.completedAt ?? session.startedAt;

export const calculateProgramWeek = (
  completedSessionCount: number,
  sessionsPerProgramWeek = COMPLETED_SESSIONS_PER_PROGRAM_WEEK,
): number => {
  if (!Number.isFinite(completedSessionCount) || completedSessionCount <= 0) {
    return MIN_PROGRAM_WEEK;
  }

  const safeSessionsPerWeek = Math.max(1, Math.trunc(sessionsPerProgramWeek));
  const completed = Math.max(0, Math.trunc(completedSessionCount));
  const adherenceWeek = Math.floor(completed / safeSessionsPerWeek) + 1;
  return Math.min(MAX_PROGRAM_WEEK, adherenceWeek);
};

export const calculateProgramWeekFromHistory = (
  sessions: readonly WorkoutSession[],
  userId: UserId,
  now = Date.now(),
): number => {
  if (!Number.isFinite(now)) {
    return MIN_PROGRAM_WEEK;
  }

  const completedSessions = sessions
    .filter(
      (session) =>
        session.userId === userId &&
        session.status === 'completed' &&
        Number.isFinite(getCompletionTimestamp(session)) &&
        getCompletionTimestamp(session) <= now,
    )
    .sort((left, right) => getCompletionTimestamp(left) - getCompletionTimestamp(right));

  const lastSession = completedSessions.at(-1);
  if (!lastSession) {
    return MIN_PROGRAM_WEEK;
  }

  if (now - getCompletionTimestamp(lastSession) > INACTIVITY_RESET_MILLISECONDS) {
    return MIN_PROGRAM_WEEK;
  }

  let activeCycleStartIndex = 0;
  for (let index = 1; index < completedSessions.length; index += 1) {
    const previous = completedSessions[index - 1];
    const current = completedSessions[index];
    if (
      previous &&
      current &&
      getCompletionTimestamp(current) - getCompletionTimestamp(previous) >
        INACTIVITY_RESET_MILLISECONDS
    ) {
      activeCycleStartIndex = index;
    }
  }

  return calculateProgramWeek(completedSessions.length - activeCycleStartIndex);
};
