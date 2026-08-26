import type { ActiveWorkoutState, ExerciseProgressRecord, WorkoutSession } from '@/types';
import { calculateExerciseVolume } from '@/utils/volume';
import { getPendingParticipantIds } from '@/utils/workout-completion';
import { getDatabase } from './database';
import { exerciseProgressId } from './exercise-progress';

export const getActiveWorkout = async (): Promise<ActiveWorkoutState | null> => {
  const database = await getDatabase();
  const stored = await database.get('activeWorkout', 'current');
  return stored?.state ?? null;
};

export const saveActiveWorkout = async (state: ActiveWorkoutState): Promise<void> => {
  const database = await getDatabase();
  await database.put('activeWorkout', { id: 'current', state });
};

export const discardActiveWorkout = async (): Promise<void> => {
  const database = await getDatabase();
  await database.delete('activeWorkout', 'current');
};

export const completeActiveWorkout = async (
  completedAt = Date.now(),
): Promise<WorkoutSession[]> => {
  const database = await getDatabase();
  const transaction = database.transaction(
    ['activeWorkout', 'workoutSessions', 'exerciseProgress'],
    'readwrite',
  );
  const stored = await transaction.objectStore('activeWorkout').get('current');

  if (!stored) {
    await transaction.done;
    return [];
  }

  const pendingParticipantIds = getPendingParticipantIds(stored.state);
  if (pendingParticipantIds.length > 0) {
    await transaction.done;
    throw new Error('Não é possível concluir enquanto houver participantes com treino pendente.');
  }

  const completedSessions = stored.state.participantIds.flatMap((userId) => {
    const session = stored.state.sessions[userId];
    if (!session) {
      return [];
    }

    const completedSession: WorkoutSession = {
      ...session,
      status: 'completed',
      updatedAt: completedAt,
      completedAt,
      durationSeconds: Math.max(0, Math.floor((completedAt - session.startedAt) / 1_000)),
    };
    return [completedSession];
  });

  await Promise.all(
    completedSessions.map((session) =>
      transaction.objectStore('workoutSessions').put(session),
    ),
  );

  const progressStore = transaction.objectStore('exerciseProgress');
  const progressUpdates = completedSessions.flatMap((session) =>
    session.exercises
      .filter((exercise) => exercise.sets.some((set) => set.completed))
      .map(async (exercise) => {
        const id = exerciseProgressId(session.userId, exercise.exerciseId);
        const current = await progressStore.get(id);
        const completedSets = exercise.sets.filter((set) => set.completed);
        const loads = completedSets.flatMap((set) =>
          set.loadKg === null ? [] : [set.loadKg],
        );
        const lastSet = completedSets.at(-1);
        const lastLoadKg = lastSet?.loadKg ?? null;
        const currentBestLoad = current?.bestLoadKg ?? null;
        const sessionBestLoad = loads.length > 0 ? Math.max(...loads) : null;
        const bestLoadKg =
          currentBestLoad === null
            ? sessionBestLoad
            : sessionBestLoad === null
              ? currentBestLoad
              : Math.max(currentBestLoad, sessionBestLoad);
        const record: ExerciseProgressRecord = {
          id,
          userId: session.userId,
          exerciseId: exercise.exerciseId,
          lastLoadKg,
          bestLoadKg,
          bestVolumeKg: Math.max(current?.bestVolumeKg ?? 0, calculateExerciseVolume(exercise)),
          lastRepetitions: lastSet?.repetitions ?? null,
          updatedAt: completedAt,
        };
        await progressStore.put(record);
      }),
  );
  await Promise.all(progressUpdates);
  await transaction.objectStore('activeWorkout').delete('current');
  await transaction.done;
  return completedSessions;
};
