import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getWorkoutTemplate } from '@/data';
import type { CardioPrescription } from '@/types';
import { createActiveWorkout } from '@/utils';
import { CardioTracker } from './CardioTracker';

const getCardioFixture = () => {
  const template = getWorkoutTemplate('lucas', 'A');
  if (!template) throw new Error('Ficha de teste não encontrada.');
  const prescription = template.exercises.find(
    (item): item is CardioPrescription => item.kind === 'cardio',
  );
  const session = createActiveWorkout([template], { now: 1_000 }).sessions.lucas?.cardio;
  if (!prescription || !session) throw new Error('Cardio de teste não encontrado.');
  return { prescription, session };
};

describe('CardioTracker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(10_000);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('atualiza a duração iniciada a partir do timestamp real', () => {
    const { prescription, session } = getCardioFixture();
    const noop = vi.fn();

    render(
      <CardioTracker
        prescription={prescription}
        session={{ ...session, startedAt: 5_000 }}
        onStart={noop}
        onUpdate={noop}
        onComplete={noop}
      />,
    );

    expect(screen.getByText('00:05')).toBeVisible();
    act(() => {
      vi.advanceTimersByTime(2_000);
    });
    expect(screen.getByText('00:07')).toBeVisible();
  });

  it('exibe a duração registrada enquanto o cardio ainda não começou', () => {
    const { prescription, session } = getCardioFixture();
    const noop = vi.fn();

    render(
      <CardioTracker
        prescription={prescription}
        session={{ ...session, durationSeconds: 45 }}
        onStart={noop}
        onUpdate={noop}
        onComplete={noop}
      />,
    );

    expect(screen.getByText('00:45')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Iniciar cardio' })).toBeEnabled();
  });
});
