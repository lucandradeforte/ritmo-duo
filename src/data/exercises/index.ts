import type { Exercise } from '@/types';
import { exerciseDemonstrations } from '@/data/exercise-demonstrations';
import { fullBodyExercises } from './full-body';
import { lowerBodyExercises } from './lower-body';
import { upperBodyExercises } from './upper-body';

export { fullBodyExercises, lowerBodyExercises, upperBodyExercises };

const exerciseCatalog: readonly Exercise[] = [
  ...lowerBodyExercises,
  ...upperBodyExercises,
  ...fullBodyExercises,
];

export const exercises: readonly Exercise[] = exerciseCatalog.map((exercise) => ({
  ...exercise,
  demonstration: exerciseDemonstrations[exercise.id],
}));

export const exercisesById: Readonly<Record<string, Exercise>> = Object.fromEntries(
  exercises.map((exercise) => [exercise.id, exercise]),
);

export const getExercise = (exerciseId: string): Exercise | undefined => exercisesById[exerciseId];
