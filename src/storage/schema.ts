import type { DBSchema } from 'idb';
import type {
  ActiveWorkoutState,
  AppPreferences,
  ExerciseProgressRecord,
  UserId,
  UserProfile,
  WorkoutSession,
  WorkoutSessionStatus,
} from '@/types';

export interface StorageMetadata {
  key: string;
  value: number | string;
}

export interface StoredActiveWorkout {
  id: 'current';
  state: ActiveWorkoutState;
}

export interface RitmoDuoSchema extends DBSchema {
  metadata: {
    key: string;
    value: StorageMetadata;
  };
  users: {
    key: UserId;
    value: UserProfile;
  };
  preferences: {
    key: 'app';
    value: AppPreferences;
  };
  workoutSessions: {
    key: string;
    value: WorkoutSession;
    indexes: {
      'by-user': UserId;
      'by-status': WorkoutSessionStatus;
      'by-started-at': number;
    };
  };
  activeWorkout: {
    key: 'current';
    value: StoredActiveWorkout;
  };
  exerciseProgress: {
    key: string;
    value: ExerciseProgressRecord;
    indexes: {
      'by-user': UserId;
      'by-exercise': string;
    };
  };
}
