import { useCallback, useEffect, useRef, useState } from 'react';

export type WakeLockStatus = 'unsupported' | 'idle' | 'requesting' | 'active' | 'denied';

export interface UseWakeLockOptions {
  enabled: boolean;
  workoutActive: boolean;
}

export const supportsWakeLock = (navigatorObject: Navigator = navigator): boolean =>
  'wakeLock' in navigatorObject;

export const useWakeLock = ({ enabled, workoutActive }: UseWakeLockOptions) => {
  const isSupported = typeof navigator !== 'undefined' && supportsWakeLock(navigator);
  const [status, setStatus] = useState<WakeLockStatus>(isSupported ? 'idle' : 'unsupported');
  const sentinelRef = useRef<WakeLockSentinel | undefined>(undefined);
  const shouldHoldRef = useRef(false);

  const release = useCallback(async () => {
    const sentinel = sentinelRef.current;
    sentinelRef.current = undefined;

    if (sentinel && !sentinel.released) {
      try {
        await sentinel.release();
      } catch {
        // The browser may have released it already while moving to background.
      }
    }

    setStatus(isSupported ? 'idle' : 'unsupported');
  }, [isSupported]);

  const request = useCallback(async () => {
    if (!shouldHoldRef.current || document.visibilityState !== 'visible' || !isSupported) {
      return false;
    }

    if (sentinelRef.current && !sentinelRef.current.released) return true;

    setStatus('requesting');

    try {
      const sentinel = await navigator.wakeLock.request('screen');

      if (!shouldHoldRef.current) {
        await sentinel.release();
        return false;
      }

      sentinelRef.current = sentinel;
      setStatus('active');
      sentinel.addEventListener(
        'release',
        () => {
          if (sentinelRef.current === sentinel) {
            sentinelRef.current = undefined;
            setStatus('idle');
          }
        },
        { once: true },
      );
      return true;
    } catch {
      setStatus('denied');
      return false;
    }
  }, [isSupported]);

  useEffect(() => {
    shouldHoldRef.current = enabled && workoutActive;

    if (shouldHoldRef.current) {
      void request();
    } else {
      void release();
    }
  }, [enabled, release, request, workoutActive]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && shouldHoldRef.current) {
        void request();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      shouldHoldRef.current = false;
      void release();
    };
  }, [release, request]);

  return {
    isSupported,
    status,
    request,
    release,
  };
};
