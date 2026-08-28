import { useMemo } from 'react';
import type {
  ExerciseProgressRecord,
  UserId,
  UserProfile,
  WeightEntry,
  WorkoutSession,
} from '@/types';

interface UseSelectedUserDataOptions {
  selectedUserId: UserId | null;
  profiles: readonly UserProfile[];
  sessions: readonly WorkoutSession[];
  progress: readonly ExerciseProgressRecord[];
  weightEntries: readonly WeightEntry[];
}

export function useSelectedUserData({
  selectedUserId,
  profiles,
  sessions,
  progress,
  weightEntries,
}: UseSelectedUserDataOptions) {
  const selectedUser = useMemo(
    () => profiles.find((profile) => profile.id === selectedUserId) ?? null,
    [profiles, selectedUserId],
  );
  const userSessions = useMemo(
    () =>
      sessions.filter(
        (session) => session.userId === selectedUserId && session.status === 'completed',
      ),
    [selectedUserId, sessions],
  );
  const userProgress = useMemo(
    () => progress.filter((record) => record.userId === selectedUserId),
    [progress, selectedUserId],
  );
  const userWeightEntries = useMemo(
    () =>
      weightEntries
        .filter((entry) => entry.userId === selectedUserId)
        .sort(
          (left, right) =>
            left.recordedAt - right.recordedAt || left.createdAt - right.createdAt,
        ),
    [selectedUserId, weightEntries],
  );
  const currentUser = useMemo(() => {
    const currentWeightKg = userWeightEntries.at(-1)?.weightKg ?? selectedUser?.weightKg;
    return selectedUser && currentWeightKg !== undefined
      ? { ...selectedUser, weightKg: currentWeightKg }
      : selectedUser;
  }, [selectedUser, userWeightEntries]);

  return {
    selectedUser,
    currentUser,
    userSessions,
    userProgress,
    userWeightEntries,
  };
}
