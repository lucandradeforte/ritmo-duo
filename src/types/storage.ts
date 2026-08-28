import type { UserProfile, WeightEntry } from './domain';
import type {
  ActiveWorkoutState,
  ExerciseProgressRecord,
  WorkoutSession,
} from './session';

export type ThemePreference = 'system' | 'dark' | 'light';

export interface AppPreferences {
  id: 'app';
  theme: ThemePreference;
  lastUserId: UserProfile['id'] | null;
  soundEnabled: boolean;
  wakeLockEnabled: boolean;
  installHelpDismissed: boolean;
  updatedAt: number;
}

export interface BackupPayload {
  app: 'ritmo-duo';
  storageVersion: number;
  exportedAt: number;
  data: {
    users: UserProfile[];
    preferences: AppPreferences;
    workoutSessions: WorkoutSession[];
    activeWorkout: ActiveWorkoutState | null;
    exerciseProgress: ExerciseProgressRecord[];
    weightEntries: WeightEntry[];
  };
}

export interface ImportBackupResult {
  users: number;
  workoutSessions: number;
  exerciseProgress: number;
  weightEntries: number;
  restoredActiveWorkout: boolean;
}
