import type { ExerciseSession, SetSession, WorkoutSession } from '@/types';

export const calculateSetVolume = (set: SetSession): number => {
  if (!set.completed || set.loadKg === null || set.repetitions === null) {
    return 0;
  }

  if (set.loadKg < 0 || set.repetitions < 0) {
    return 0;
  }

  return set.loadKg * set.repetitions;
};

export const calculateExerciseVolume = (exercise: ExerciseSession): number =>
  exercise.sets.reduce((volume, set) => volume + calculateSetVolume(set), 0);

export const calculateSessionVolume = (session: WorkoutSession): number =>
  session.exercises.reduce((volume, exercise) => volume + calculateExerciseVolume(exercise), 0);

export interface WorkoutSessionStats {
  completedExercises: number;
  completedSets: number;
  volumeKg: number;
}

export const calculateSessionStats = (session: WorkoutSession): WorkoutSessionStats => ({
  completedExercises: session.exercises.filter((exercise) =>
    exercise.sets.some((set) => set.completed),
  ).length,
  completedSets: session.exercises.reduce(
    (count, exercise) => count + exercise.sets.filter((set) => set.completed).length,
    0,
  ),
  volumeKg: calculateSessionVolume(session),
});
