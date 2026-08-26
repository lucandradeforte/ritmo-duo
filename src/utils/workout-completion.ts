import type { ActiveWorkoutState, UserId, WorkoutSession } from '@/types';

export const isSessionReadyForCompletion = (session: WorkoutSession): boolean =>
  session.feedback !== null && (session.cardio === null || session.cardio.completedAt !== null);

export const getPendingParticipantIds = (state: ActiveWorkoutState): UserId[] =>
  state.participantIds.filter((userId) => {
    const session = state.sessions[userId];
    return !session || !isSessionReadyForCompletion(session);
  });
