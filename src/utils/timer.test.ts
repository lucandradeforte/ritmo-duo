import { describe, expect, it } from 'vitest';
import {
  adjustRestDuration,
  createRestTimer,
  formatClock,
  getElapsedSeconds,
  getRestRemainingSeconds,
  isRestComplete,
} from './timer';

describe('cronômetro baseado em timestamps', () => {
  const timer = createRestTimer({
    durationSeconds: 90,
    userId: 'lucas',
    exerciseSessionId: 'exercise-1',
    setSessionId: 'set-1',
    startedAt: 1_000,
  });

  it('recupera o tempo correto após suspensão da aplicação', () => {
    expect(getRestRemainingSeconds(timer, 31_000)).toBe(60);
    expect(getRestRemainingSeconds(timer, 95_000)).toBe(0);
    expect(isRestComplete(timer, 95_000)).toBe(true);
  });

  it('ajusta o prazo sem depender de setInterval', () => {
    expect(getRestRemainingSeconds(adjustRestDuration(timer, 15), 31_000)).toBe(75);
    expect(getRestRemainingSeconds(adjustRestDuration(timer, -15), 31_000)).toBe(45);
  });

  it('calcula duração total e formata relógio', () => {
    expect(getElapsedSeconds(1_000, 66_900)).toBe(65);
    expect(formatClock(65)).toBe('01:05');
    expect(formatClock(3_661)).toBe('01:01:01');
  });
});
