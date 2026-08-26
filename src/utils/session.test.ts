import { describe, expect, it } from 'vitest';
import { getWorkoutTemplate } from '@/data';
import {
  completeActiveWorkoutSet,
  createActiveWorkout,
  createWorkoutSession,
  switchActiveWorkoutUser,
  updateActiveWorkoutSet,
} from './session';

describe('criação e atualização de sessão', () => {
  const lucasA = getWorkoutTemplate('lucas', 'A');
  const geovannaA = getWorkoutTemplate('geovanna', 'A');

  it('reduz a semana 1 para uma série de trabalho', () => {
    expect(lucasA).toBeDefined();
    if (!lucasA) return;

    const session = createWorkoutSession(lucasA, { now: 1_000, programWeek: 1 });
    expect(session.programWeek).toBe(1);
    expect(session.exercises.every((exercise) => exercise.sets.length === 1)).toBe(true);
    expect(session.cardio?.targetDurationSeconds).toBe(480);
  });

  it('persiste a semana normalizada e aplica o alvo de cardio da fase', () => {
    expect(lucasA).toBeDefined();
    expect(geovannaA).toBeDefined();
    if (!lucasA || !geovannaA) return;

    const lucasWeekThree = createWorkoutSession(lucasA, { now: 4_000, programWeek: 3 });
    const geovannaWeekFive = createWorkoutSession(geovannaA, { now: 4_000, programWeek: 5 });
    const clamped = createWorkoutSession(lucasA, { now: 4_000, programWeek: 99 });

    expect(lucasWeekThree).toMatchObject({
      programWeek: 3,
      cardio: { targetDurationSeconds: 720 },
    });
    expect(geovannaWeekFive).toMatchObject({
      programWeek: 5,
      cardio: { targetDurationSeconds: 1_200 },
    });
    expect(clamped.programWeek).toBe(8);
  });

  it('assume a fase conservadora da semana 1 quando a semana não é informada', () => {
    expect(lucasA).toBeDefined();
    if (!lucasA) return;

    const session = createWorkoutSession(lucasA, { now: 1_000 });
    expect(session.exercises.every((exercise) => exercise.sets.length === 1)).toBe(true);
    expect(session.cardio?.targetDurationSeconds).toBe(480);
  });

  it('cria modo dupla com históricos independentes e alternância por toque', () => {
    expect(lucasA).toBeDefined();
    expect(geovannaA).toBeDefined();
    if (!lucasA || !geovannaA) return;

    const active = createActiveWorkout([lucasA, geovannaA], {
      now: 2_000,
      programWeekByUserId: { lucas: 5, geovanna: 3 },
    });
    expect(active.mode).toBe('duo');
    expect(active.sessions.lucas?.id).not.toBe(active.sessions.geovanna?.id);
    expect(active.sessions.lucas?.programWeek).toBe(5);
    expect(active.sessions.geovanna?.programWeek).toBe(3);
    expect(switchActiveWorkoutUser(active, 'geovanna', 2_100).activeUserId).toBe('geovanna');
  });

  it('edita e conclui uma série preservando o restante do treino', () => {
    expect(lucasA).toBeDefined();
    if (!lucasA) return;

    const active = createActiveWorkout([lucasA], { now: 3_000 });
    const exercise = active.sessions.lucas?.exercises[0];
    const targetSet = exercise?.sets[0];
    expect(exercise).toBeDefined();
    expect(targetSet).toBeDefined();
    if (!exercise || !targetSet) return;

    const edited = updateActiveWorkoutSet(
      active,
      'lucas',
      exercise.id,
      targetSet.id,
      { loadKg: 12, repetitions: 10, rir: 3 },
      3_100,
    );
    const completed = completeActiveWorkoutSet(
      edited,
      'lucas',
      exercise.id,
      targetSet.id,
      3_200,
    );
    const resultingSet = completed.sessions.lucas?.exercises[0]?.sets[0];

    expect(resultingSet).toMatchObject({
      loadKg: 12,
      repetitions: 10,
      rir: 3,
      completed: true,
      completedAt: 3_200,
    });
  });
});
