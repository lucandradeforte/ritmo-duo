import { describe, expect, it } from 'vitest';
import type { UserId, WorkoutSession, WorkoutSessionStatus } from '@/types';
import {
  calculateProgramWeek,
  calculateProgramWeekFromHistory,
  INACTIVITY_RESET_DAYS,
} from './program-week';

const day = 24 * 60 * 60 * 1_000;

const session = (
  id: string,
  completedAt: number,
  options: {
    userId?: UserId;
    status?: WorkoutSessionStatus;
  } = {},
): WorkoutSession => ({
  id,
  userId: options.userId ?? 'lucas',
  programWeek: 1,
  workoutTemplateId: 'lucas-workout-a',
  workoutCode: 'A',
  status: options.status ?? 'completed',
  startedAt: completedAt - 60 * 60 * 1_000,
  updatedAt: completedAt,
  completedAt: options.status === 'completed' || !options.status ? completedAt : null,
  durationSeconds: 60 * 60,
  currentExerciseIndex: 0,
  exercises: [],
  cardio: null,
  feedback: null,
});

describe('fase do programa baseada em aderência', () => {
  it('avança uma semana a cada três sessões concluídas e limita na semana 8', () => {
    expect(calculateProgramWeek(0)).toBe(1);
    expect(calculateProgramWeek(2)).toBe(1);
    expect(calculateProgramWeek(3)).toBe(2);
    expect(calculateProgramWeek(6)).toBe(3);
    expect(calculateProgramWeek(100)).toBe(8);
  });

  it('não avança apenas porque o calendário passou', () => {
    const firstSession = session('one', day);
    const twoWeeksLater = day + INACTIVITY_RESET_DAYS * day;

    expect(calculateProgramWeekFromHistory([firstSession], 'lucas', twoWeeksLater)).toBe(1);
  });

  it('conta somente sessões concluídas do usuário correto', () => {
    const sessions = [
      session('one', day),
      session('two', day * 2),
      session('active', day * 3, { status: 'active' }),
      session('discarded', day * 3, { status: 'discarded' }),
      session('geovanna', day * 3, { userId: 'geovanna' }),
      session('three', day * 3),
    ];

    expect(calculateProgramWeekFromHistory(sessions, 'lucas', day * 4)).toBe(2);
    expect(calculateProgramWeekFromHistory(sessions, 'geovanna', day * 4)).toBe(1);
  });

  it('reinicia na semana 1 quando a última sessão ocorreu há mais de 14 dias', () => {
    const sessions = Array.from({ length: 12 }, (_, index) =>
      session(`old-${index}`, (index + 1) * day),
    );
    const now = 12 * day + (INACTIVITY_RESET_DAYS + 1) * day;

    expect(calculateProgramWeekFromHistory(sessions, 'lucas', now)).toBe(1);
  });

  it('usa apenas o novo bloco de aderência depois de uma pausa superior a 14 dias', () => {
    const oldCycle = Array.from({ length: 9 }, (_, index) =>
      session(`old-${index}`, (index + 1) * day),
    );
    const returnStart = 30 * day;
    const newCycle = [
      session('return-one', returnStart),
      session('return-two', returnStart + 2 * day),
      session('return-three', returnStart + 4 * day),
    ];

    expect(
      calculateProgramWeekFromHistory([...oldCycle, ...newCycle], 'lucas', returnStart + 5 * day),
    ).toBe(2);
  });
});
