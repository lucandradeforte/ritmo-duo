import { useEffect, useState } from 'react';
import { getElapsedSeconds } from '@/utils';

interface UseWorkoutElapsedSecondsOptions {
  startedAt: number | null;
  completedAt?: number | null;
  fallbackSeconds?: number;
}

export function useWorkoutElapsedSeconds({
  startedAt,
  completedAt = null,
  fallbackSeconds = 0,
}: UseWorkoutElapsedSecondsOptions): number {
  const [now, setNow] = useState(() => Date.now());
  const running = startedAt !== null && completedAt === null;

  useEffect(() => {
    if (!running) return undefined;

    const sync = () => setNow(Date.now());
    sync();
    const interval = window.setInterval(sync, 1_000);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('focus', sync);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('focus', sync);
    };
  }, [running, startedAt]);

  return startedAt === null
    ? fallbackSeconds
    : getElapsedSeconds(startedAt, now, completedAt);
}
