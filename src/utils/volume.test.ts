import { describe, expect, it } from 'vitest';
import type { ExerciseSession, SetSession, WorkoutSession } from '@/types';
import { calculateExerciseVolume, calculateSessionStats, calculateSetVolume } from './volume';

const set = (id: string, loadKg: number | null, repetitions: number | null, completed: boolean): SetSession => ({
  id,
  setNumber: 1,
  loadKg,
  repetitions,
  durationSeconds: null,
  rir: 3,
  completed,
  completedAt: completed ? 1_000 : null,
});

const exercise: ExerciseSession = {
  id: 'exercise-session',
  prescriptionId: 'prescription',
  exerciseId: 'exercise',
  sets: [set('one', 20, 12, true), set('two', 20, 10, true), set('three', 20, 8, false)],
  startedAt: 1_000,
  completedAt: null,
  skipped: false,
};

describe('volume de treino', () => {
  it('contabiliza apenas séries concluídas com dados válidos', () => {
    expect(calculateSetVolume(exercise.sets[0]!)).toBe(240);
    expect(calculateSetVolume(exercise.sets[2]!)).toBe(0);
    expect(calculateExerciseVolume(exercise)).toBe(440);
  });

  it('resume exercícios, séries e volume', () => {
    const session: WorkoutSession = {
      id: 'session',
      userId: 'lucas',
      programWeek: 1,
      workoutTemplateId: 'lucas-workout-a',
      workoutCode: 'A',
      status: 'completed',
      startedAt: 1_000,
      updatedAt: 60_000,
      completedAt: 60_000,
      durationSeconds: 59,
      currentExerciseIndex: 0,
      exercises: [exercise],
      cardio: null,
      feedback: null,
    };

    expect(calculateSessionStats(session)).toEqual({
      completedExercises: 1,
      completedSets: 2,
      volumeKg: 440,
    });
  });
});
