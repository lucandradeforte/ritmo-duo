import { useCallback, useEffect, useState } from 'react';
import { users as seedUsers } from '@/data';
import {
  getActiveWorkout,
  getPreferences,
  initializeStorage,
  listExerciseProgress,
  listUserProfiles,
  listWeightEntries,
  listWorkoutSessions,
} from '@/storage';
import type {
  ActiveWorkoutState,
  AppPreferences,
  ExerciseProgressRecord,
  UserProfile,
  WeightEntry,
  WorkoutSession,
} from '@/types';

interface AppState {
  preferences: AppPreferences | null;
  profiles: UserProfile[];
  sessions: WorkoutSession[];
  progress: ExerciseProgressRecord[];
  weightEntries: WeightEntry[];
  activeWorkout: ActiveWorkoutState | null;
}

const INITIAL_STATE: AppState = {
  preferences: null,
  profiles: [...seedUsers],
  sessions: [],
  progress: [],
  weightEntries: [],
  activeWorkout: null,
};

const loadAppState = async (): Promise<AppState> => {
  await initializeStorage();
  const [preferences, profiles, sessions, progress, weightEntries, activeWorkout] =
    await Promise.all([
      getPreferences(),
      listUserProfiles(),
      listWorkoutSessions(),
      listExerciseProgress(),
      listWeightEntries(),
      getActiveWorkout(),
    ]);

  return {
    preferences,
    profiles: profiles.length > 0 ? profiles : [...seedUsers],
    sessions,
    progress,
    weightEntries,
    activeWorkout,
  };
};

export function useAppBootstrap() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);

  const applyLoadedState = useCallback((next: AppState) => {
    setState(next);
    setRecoveryOpen(next.activeWorkout !== null);
  }, []);

  const refreshState = useCallback(async () => {
    const next = await loadAppState();
    applyLoadedState(next);
  }, [applyLoadedState]);

  useEffect(() => {
    let cancelled = false;
    void loadAppState()
      .then((next) => {
        if (!cancelled) applyLoadedState(next);
      })
      .catch(() => {
        if (!cancelled) setFatalError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [applyLoadedState]);

  const setPreferences = useCallback((preferences: AppPreferences) => {
    setState((current) => ({ ...current, preferences }));
  }, []);

  const addWeightEntry = useCallback((entry: WeightEntry) => {
    setState((current) => ({
      ...current,
      weightEntries: [...current.weightEntries, entry],
    }));
  }, []);

  const setActiveWorkout = useCallback((activeWorkout: ActiveWorkoutState | null) => {
    setState((current) => ({ ...current, activeWorkout }));
  }, []);

  return {
    ...state,
    loading,
    fatalError,
    recoveryOpen,
    setRecoveryOpen,
    setPreferences,
    addWeightEntry,
    setActiveWorkout,
    refreshState,
  };
}
