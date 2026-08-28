import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkoutElapsedTime } from './WorkoutElapsedTime';

describe('WorkoutElapsedTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(10_000);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('atualiza o texto pelo timestamp sem renderizar novamente o componente pai', () => {
    let parentRenderCount = 0;

    function Parent() {
      parentRenderCount += 1;
      return <output><WorkoutElapsedTime startedAt={5_000} /></output>;
    }

    render(<Parent />);
    expect(screen.getByText('00:05')).toBeVisible();

    act(() => {
      vi.advanceTimersByTime(2_000);
    });

    expect(screen.getByText('00:07')).toBeVisible();
    expect(parentRenderCount).toBe(1);
  });

  it('mantém a duração congelada quando há timestamp de conclusão', () => {
    render(
      <output>
        <WorkoutElapsedTime startedAt={2_000} completedAt={8_000} />
      </output>,
    );

    act(() => {
      vi.advanceTimersByTime(5_000);
    });

    expect(screen.getByText('00:06')).toBeVisible();
    expect(vi.getTimerCount()).toBe(0);
  });
});
