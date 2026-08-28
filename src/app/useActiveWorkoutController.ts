import { useCallback, useEffect, useRef, useState } from 'react';
import { saveActiveWorkout } from '@/storage';
import type { ActiveWorkoutState } from '@/types';

export type PersistenceState = 'idle' | 'saving' | 'error';

interface UseActiveWorkoutControllerOptions {
  activeWorkout: ActiveWorkoutState | null;
  onActiveWorkoutChange: (state: ActiveWorkoutState | null) => void;
}

export function useActiveWorkoutController({
  activeWorkout,
  onActiveWorkoutChange,
}: UseActiveWorkoutControllerOptions) {
  const activeWorkoutRef = useRef<ActiveWorkoutState | null>(activeWorkout);
  const activeWriteQueueRef = useRef<Promise<void>>(Promise.resolve());
  const persistSequenceRef = useRef(0);
  const [persistenceState, setPersistenceState] = useState<PersistenceState>('idle');

  useEffect(() => {
    activeWorkoutRef.current = activeWorkout;
  }, [activeWorkout]);

  const persistActiveWorkout = useCallback(
    (next: ActiveWorkoutState): Promise<boolean> => {
      activeWorkoutRef.current = next;
      onActiveWorkoutChange(next);
      const sequence = ++persistSequenceRef.current;
      setPersistenceState('saving');

      const result = activeWriteQueueRef.current
        .then(() => saveActiveWorkout(next))
        .then(() => {
          if (sequence === persistSequenceRef.current) setPersistenceState('idle');
          return true;
        })
        .catch(() => {
          if (sequence === persistSequenceRef.current) setPersistenceState('error');
          return false;
        });

      activeWriteQueueRef.current = result.then(() => undefined);
      return result;
    },
    [onActiveWorkoutChange],
  );

  const clearActiveWorkout = useCallback(() => {
    persistSequenceRef.current += 1;
    setPersistenceState('idle');
    activeWorkoutRef.current = null;
    onActiveWorkoutChange(null);
  }, [onActiveWorkoutChange]);

  const getActiveWorkout = useCallback(() => activeWorkoutRef.current, []);
  const waitForPendingWrites = useCallback(() => activeWriteQueueRef.current, []);
  const retryPersistence = useCallback(() => {
    const current = activeWorkoutRef.current;
    return current ? persistActiveWorkout(current) : Promise.resolve(false);
  }, [persistActiveWorkout]);

  return {
    persistenceState,
    persistActiveWorkout,
    clearActiveWorkout,
    getActiveWorkout,
    waitForPendingWrites,
    retryPersistence,
  };
}
