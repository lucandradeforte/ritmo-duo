export type UserId = 'lucas' | 'geovanna';

export type WorkoutCode = 'A' | 'B' | 'C';

export type Weekday = 'tuesday' | 'thursday' | 'friday';

export type ExerciseCategory =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'core'
  | 'full-body'
  | 'cardio';

export type EquipmentType =
  | 'bodyweight'
  | 'dumbbell'
  | 'barbell'
  | 'multi-station'
  | 'bench'
  | 'treadmill'
  | 'bike'
  | 'stability-ball';

export type CardioModality = 'treadmill' | 'bike';

export interface UserProfile {
  id: UserId;
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  primaryGoal: 'weight-loss';
  secondaryGoals: Array<'health' | 'muscle-gain'>;
  experience: 'returning-beginner';
  activityLevel: 'sedentary';
  preferredCardio: CardioModality;
  trainingDays: Weekday[];
  maxSessionMinutes: number;
  healthNotes: string[];
}

export interface ExerciseMuscles {
  primary: string[];
  secondary: string[];
}

export interface ExerciseAlternatives {
  easier: string;
  standard: string;
  progression: string;
}

export interface ExerciseMedia {
  label: string;
  url: string;
  kind: 'article' | 'manual' | 'video';
  external: true;
  offlineMessage: string;
}

export interface ExerciseInstructions {
  configuration: string[];
  execution: string[];
  technicalPoints: string[];
  commonMistakes: string[];
  expectedSensation: string;
  stopSignals: string[];
  alternatives: ExerciseAlternatives;
}

export interface Exercise {
  id: string;
  name: string;
  englishName?: string;
  categories: ExerciseCategory[];
  equipmentTypes: EquipmentType[];
  equipmentLabel: string;
  muscles: ExerciseMuscles;
  instructions: ExerciseInstructions;
  media?: ExerciseMedia;
}

export interface RepRange {
  min: number;
  max: number;
}

export interface StrengthPrescription {
  id: string;
  kind: 'strength';
  order: number;
  exerciseId: string;
  sets: number;
  repetitions: RepRange;
  restSeconds: number;
  targetRir: RepRange;
  preparationSets?: number;
  userNotes?: string[];
}

export interface CarryPrescription {
  id: string;
  kind: 'carry';
  order: number;
  exerciseId: string;
  sets: number;
  durationSeconds: RepRange;
  restSeconds: number;
  targetRpe: RepRange;
  userNotes?: string[];
}

export interface CardioPrescription {
  id: string;
  kind: 'cardio';
  order: number;
  modality: CardioModality;
  equipmentLabel: string;
  durationMinutes: RepRange;
  targetRpe: RepRange;
  talkTest: string;
  userNotes?: string[];
}

export type ExercisePrescription =
  | StrengthPrescription
  | CarryPrescription
  | CardioPrescription;

export interface WarmupPrescription {
  general: {
    modality: CardioModality;
    durationMinutes: RepRange;
    targetRpe: RepRange;
    instructions: string[];
  };
  specific: {
    repetitions: RepRange;
    instructions: string[];
  };
}

export interface WorkoutTemplate {
  id: string;
  userId: UserId;
  code: WorkoutCode;
  weekday: Weekday;
  title: string;
  focus: string[];
  estimatedMinutes: RepRange;
  warmup: WarmupPrescription;
  exercises: ExercisePrescription[];
}

export interface TrainingPhase {
  id: string;
  weeks: RepRange;
  title: string;
  instructions: string[];
}

export interface WorkoutPlan {
  id: string;
  userId: UserId;
  name: string;
  objective: string;
  templates: WorkoutTemplate[];
  phases: TrainingPhase[];
  progressionNotes: string[];
  safetyNotes: string[];
}

export interface EffortScaleEntry {
  rir: number;
  approximateRpe: number;
  description: string;
}

export interface TrainingGuidance {
  effortScale: EffortScaleEntry[];
  initialLoadProtocol: string[];
  duoTraining: string[];
  cardio: Record<UserId, string[]>;
  loadProgression: {
    dumbbells: string;
    barbell: string;
    multiStation: string;
    cardio: string;
  };
}
