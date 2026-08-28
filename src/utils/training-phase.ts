import type {
  CardioPrescription,
  ExercisePrescription,
  RepRange,
  StrengthPrescription,
  UserId,
} from '@/types';

export const MIN_PROGRAM_WEEK = 1;
export const MAX_PROGRAM_WEEK = 8;

const lucasThirdSetExercises = new Set([
  'goblet-squat-to-bench',
  'tander-lat-pulldown',
  'tander-pec-deck',
  'dumbbell-romanian-deadlift',
  'dumbbell-chest-press',
  'single-arm-dumbbell-row',
]);

export const normalizeProgramWeek = (programWeek: number): number => {
  if (!Number.isFinite(programWeek)) {
    return MIN_PROGRAM_WEEK;
  }

  return Math.min(
    MAX_PROGRAM_WEEK,
    Math.max(MIN_PROGRAM_WEEK, Math.trunc(programWeek)),
  );
};

export const getEffectiveTargetRir = (
  baseTargetRir: RepRange,
  userId: UserId,
  programWeek: number,
): RepRange => {
  const week = normalizeProgramWeek(programWeek);

  if (week <= 2) {
    return { min: 3, max: 4 };
  }

  if (week >= 5) {
    return userId === 'lucas' ? { min: 2, max: 3 } : { min: 3, max: 3 };
  }

  return { ...baseTargetRir };
};

export const getEffectiveSetCount = (
  baseSets: number,
  userId: UserId,
  exerciseId: string,
  programWeek: number,
  includeOptionalThirdSet = false,
): number => {
  const week = normalizeProgramWeek(programWeek);

  if (week === 1) {
    return 1;
  }

  if (
    userId === 'lucas' &&
    week >= 5 &&
    includeOptionalThirdSet &&
    lucasThirdSetExercises.has(exerciseId)
  ) {
    return Math.max(baseSets, 3);
  }

  return baseSets;
};

export const getEffectiveCardioDuration = (
  baseDurationMinutes: RepRange,
  userId: UserId,
  programWeek: number,
): RepRange => {
  const week = normalizeProgramWeek(programWeek);

  if (week === 1) {
    return { min: 8, max: 8 };
  }

  if (week === 2) {
    return { min: 10, max: 10 };
  }

  const minimumMinutes =
    week <= 4 ? Math.max(12, baseDurationMinutes.min) : userId === 'geovanna' ? 20 : Math.max(15, baseDurationMinutes.min);

  return {
    min: minimumMinutes,
    max: Math.max(minimumMinutes, baseDurationMinutes.max),
  };
};

export function getEffectivePrescription(
  prescription: StrengthPrescription,
  userId: UserId,
  programWeek: number,
): StrengthPrescription;
export function getEffectivePrescription(
  prescription: CardioPrescription,
  userId: UserId,
  programWeek: number,
): CardioPrescription;
export function getEffectivePrescription(
  prescription: ExercisePrescription,
  userId: UserId,
  programWeek: number,
): ExercisePrescription;
export function getEffectivePrescription(
  prescription: ExercisePrescription,
  userId: UserId,
  programWeek: number,
): ExercisePrescription {
  if (prescription.kind === 'strength') {
    return {
      ...prescription,
      targetRir: getEffectiveTargetRir(prescription.targetRir, userId, programWeek),
    };
  }

  if (prescription.kind === 'cardio') {
    return {
      ...prescription,
      durationMinutes: getEffectiveCardioDuration(
        prescription.durationMinutes,
        userId,
        programWeek,
      ),
    };
  }

  return prescription;
}

export const getEffectiveCardioTargetSeconds = (
  prescription: CardioPrescription,
  userId: UserId,
  programWeek: number,
): number =>
  getEffectiveCardioDuration(prescription.durationMinutes, userId, programWeek).min * 60;
