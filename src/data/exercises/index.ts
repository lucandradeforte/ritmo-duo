import type { Exercise } from '@/types';
import { fullBodyExercises } from './full-body';
import { lowerBodyExercises } from './lower-body';
import { upperBodyExercises } from './upper-body';

export { fullBodyExercises, lowerBodyExercises, upperBodyExercises };

export const exercises: readonly Exercise[] = [
  ...lowerBodyExercises,
  ...upperBodyExercises,
  ...fullBodyExercises,
];

export const exercisesById: Readonly<Record<string, Exercise>> = Object.fromEntries(
  exercises.map((exercise) => [exercise.id, exercise]),
);

export const getExercise = (exerciseId: string): Exercise | undefined => exercisesById[exerciseId];
