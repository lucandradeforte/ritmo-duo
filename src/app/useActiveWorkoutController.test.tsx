import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getWorkoutTemplate } from '@/data';
import { saveActiveWorkout } from '@/storage';
import type { ActiveWorkoutState } from '@/types';
import { createActiveWorkout } from '@/utils';
import { useActiveWorkoutController } from './useActiveWorkoutController';

vi.mock('@/storage', () => ({
  saveActiveWorkout: vi.fn(),
}));

const mockedSaveActiveWorkout = vi.mocked(saveActiveWorkout);

const createWorkoutFixture = (now: number) => {
  const template = getWorkoutTemplate('lucas', 'A');
  if (!template) throw new Error('Ficha de teste não encontrada.');
  return createActiveWorkout([template], { now });
};

describe('useActiveWorkoutController', () => {
  beforeEach(() => {
    mockedSaveActiveWorkout.mockReset();
  });

  it('serializa gravações concorrentes na ordem em que foram solicitadas', async () => {
    const events: string[] = [];
    let releaseFirstWrite: () => void = () => undefined;
    const firstWrite = new Promise<void>((resolve) => {
      releaseFirstWrite = () => resolve();
    });
    mockedSaveActiveWorkout
      .mockImplementationOnce(async () => {
        events.push('first:start');
        await firstWrite;
        events.push('first:end');
      })
      .mockImplementationOnce(() => {
        events.push('second');
        return Promise.resolve();
      });
    const onActiveWorkoutChange = vi.fn();
    const firstWorkout = createWorkoutFixture(1_000);
    const secondWorkout = createWorkoutFixture(2_000);
    const { result } = renderHook(() =>
      useActiveWorkoutController({ activeWorkout: null, onActiveWorkoutChange }),
    );

    let firstResult: Promise<boolean> = Promise.resolve(false);
    let secondResult: Promise<boolean> = Promise.resolve(false);
    act(() => {
      firstResult = result.current.persistActiveWorkout(firstWorkout);
      secondResult = result.current.persistActiveWorkout(secondWorkout);
    });

    await waitFor(() => expect(mockedSaveActiveWorkout).toHaveBeenCalledTimes(1));
    expect(events).toEqual(['first:start']);

    await act(async () => {
      releaseFirstWrite();
      await Promise.all([firstResult, secondResult]);
    });

    expect(events).toEqual(['first:start', 'first:end', 'second']);
    expect(result.current.persistenceState).toBe('idle');
  });

  it('mantém o estado mais recente e permite tentar novamente após falha', async () => {
    mockedSaveActiveWorkout
      .mockRejectedValueOnce(new Error('falha simulada'))
      .mockResolvedValueOnce();
    const workout = createWorkoutFixture(3_000);
    const onActiveWorkoutChange = vi.fn();
    const { result } = renderHook(() =>
      useActiveWorkoutController({ activeWorkout: null, onActiveWorkoutChange }),
    );

    let persisted = true;
    await act(async () => {
      persisted = await result.current.persistActiveWorkout(workout);
    });

    expect(persisted).toBe(false);
    expect(result.current.persistenceState).toBe('error');
    expect(result.current.getActiveWorkout()).toBe(workout);

    await act(async () => {
      persisted = await result.current.retryPersistence();
    });

    expect(persisted).toBe(true);
    expect(result.current.persistenceState).toBe('idle');
    expect(mockedSaveActiveWorkout).toHaveBeenNthCalledWith(2, workout);
  });

  it('sincroniza o estado restaurado pelo bootstrap antes das interações seguintes', () => {
    const restoredWorkout = createWorkoutFixture(4_000);
    const onActiveWorkoutChange = vi.fn();
    const initialProps: { activeWorkout: ActiveWorkoutState | null } = {
      activeWorkout: null,
    };
    const { result, rerender } = renderHook(
      ({ activeWorkout }: { activeWorkout: ActiveWorkoutState | null }) =>
        useActiveWorkoutController({ activeWorkout, onActiveWorkoutChange }),
      { initialProps },
    );

    rerender({ activeWorkout: restoredWorkout });

    expect(result.current.getActiveWorkout()).toBe(restoredWorkout);
  });
});
