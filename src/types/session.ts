import type { CardioModality, UserId, WorkoutCode } from './domain';

export type WorkoutSessionStatus = 'active' | 'completed' | 'discarded';

export interface SetSession {
  id: string;
  setNumber: number;
  loadKg: number | null;
  repetitions: number | null;
  durationSeconds: number | null;
  rir: number | null;
  completed: boolean;
  completedAt: number | null;
}

export interface ExerciseSession {
  id: string;
  prescriptionId: string;
  exerciseId: string;
  sets: SetSession[];
  startedAt: number | null;
  completedAt: number | null;
  skipped: boolean;
}

export interface CardioSession {
  id: string;
  prescriptionId: string;
  modality: CardioModality;
  targetDurationSeconds: number;
  startedAt: number | null;
  completedAt: number | null;
  durationSeconds: number | null;
  distanceKm: number | null;
  speedKmh: number | null;
  inclinePercent: number | null;
  intensityLevel: number | null;
  rpe: number | null;
}

export interface WorkoutFeedback {
  feeling: 'very-heavy' | 'heavy' | 'good' | 'easy' | null;
  overallRpe: number | null;
  notes: string;
}

export interface WorkoutSession {
  id: string;
  userId: UserId;
  programWeek: number;
  workoutTemplateId: string;
  workoutCode: WorkoutCode;
  status: WorkoutSessionStatus;
  startedAt: number;
  updatedAt: number;
  completedAt: number | null;
  durationSeconds: number | null;
  currentExerciseIndex: number;
  exercises: ExerciseSession[];
  cardio: CardioSession | null;
  feedback: WorkoutFeedback | null;
}

export interface RestTimerState {
  restStartedAt: number;
  restDurationSeconds: number;
  userId: UserId;
  exerciseSessionId: string;
  setSessionId: string;
}

export interface ActiveWorkoutState {
  id: string;
  mode: 'solo' | 'duo';
  participantIds: UserId[];
  activeUserId: UserId;
  sessions: Partial<Record<UserId, WorkoutSession>>;
  restTimer: RestTimerState | null;
  startedAt: number;
  updatedAt: number;
}

export interface ExerciseProgressRecord {
  id: string;
  userId: UserId;
  exerciseId: string;
  lastLoadKg: number | null;
  bestLoadKg: number | null;
  bestVolumeKg: number;
  lastRepetitions: number | null;
  updatedAt: number;
}

export interface ProgressionSuggestion {
  eligible: boolean;
  currentLoadKg: number | null;
  suggestedLoadKg: number | null;
  message: string;
  reason: string;
}

export type ProgressionEquipment =
  | 'dumbbell'
  | 'barbell-upper'
  | 'barbell-lower'
  | 'machine'
  | 'bodyweight';

export type SetSessionPatch = Partial<
  Pick<SetSession, 'loadKg' | 'repetitions' | 'durationSeconds' | 'rir' | 'completed' | 'completedAt'>
>;
