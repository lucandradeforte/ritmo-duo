import { useCallback, useEffect, useRef, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

export interface UsePwaUpdateOptions {
  workoutActive: boolean;
}

export const usePwaUpdate = ({ workoutActive }: UsePwaUpdateOptions) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updating, setUpdating] = useState(false);
  const updateServiceWorkerRef = useRef<
    ((reloadPage?: boolean) => Promise<void>) | undefined
  >(undefined);

  useEffect(() => {
    updateServiceWorkerRef.current = registerSW({
      immediate: true,
      onNeedRefresh: () => setUpdateAvailable(true),
      onOfflineReady: () => setOfflineReady(true),
      onRegisterError: () => {
        // A failed registration must never block a workout.
      },
    });
  }, []);

  const applyUpdate = useCallback(async (): Promise<boolean> => {
    if (workoutActive || !updateServiceWorkerRef.current) return false;

    setUpdating(true);
    try {
      await updateServiceWorkerRef.current(true);
      return true;
    } catch {
      setUpdating(false);
      return false;
    }
  }, [workoutActive]);

  return {
    updateAvailable,
    updateDeferred: updateAvailable && workoutActive,
    offlineReady,
    updating,
    applyUpdate,
    dismissOfflineReady: () => setOfflineReady(false),
  };
};
