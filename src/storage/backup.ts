import type {
  ActiveWorkoutState,
  AppPreferences,
  BackupPayload,
  CardioSession,
  ExerciseProgressRecord,
  ExerciseSession,
  ImportBackupResult,
  SetSession,
  UserId,
  UserProfile,
  WeightEntry,
  WorkoutSession,
} from '@/types';
import { MAX_PROGRAM_WEEK, MIN_PROGRAM_WEEK } from '@/utils/training-phase';
import { getDatabase } from './database';
import { STORAGE_VERSION } from './migrations';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isUnknownArray = (value: unknown): value is unknown[] => Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isNullableNumber = (value: unknown): value is number | null =>
  value === null || isFiniteNumber(value);

const isNullableIntegerInRange = (
  value: unknown,
  minimum: number,
  maximum: number,
): value is number | null =>
  value === null ||
  (isFiniteNumber(value) &&
    Number.isInteger(value) &&
    value >= minimum &&
    value <= maximum);

const isUserId = (value: unknown): value is UserId => value === 'lucas' || value === 'geovanna';

const isStringArray = (value: unknown): value is string[] =>
  isUnknownArray(value) && value.every((item) => typeof item === 'string');

const isUserProfile = (value: unknown): value is UserProfile => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isUserId(value.id) &&
    typeof value.name === 'string' &&
    isFiniteNumber(value.age) &&
    isFiniteNumber(value.heightCm) &&
    isFiniteNumber(value.weightKg) &&
    value.primaryGoal === 'weight-loss' &&
    isUnknownArray(value.secondaryGoals) &&
    value.secondaryGoals.every((goal) => goal === 'health' || goal === 'muscle-gain') &&
    value.experience === 'returning-beginner' &&
    value.activityLevel === 'sedentary' &&
    (value.preferredCardio === 'treadmill' || value.preferredCardio === 'bike') &&
    isUnknownArray(value.trainingDays) &&
    value.trainingDays.every(
      (day) => day === 'tuesday' || day === 'thursday' || day === 'friday',
    ) &&
    isFiniteNumber(value.maxSessionMinutes) &&
    isStringArray(value.healthNotes)
  );
};

const isPreferences = (value: unknown): value is AppPreferences => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.id === 'app' &&
    (value.theme === 'system' || value.theme === 'dark' || value.theme === 'light') &&
    (value.lastUserId === null || isUserId(value.lastUserId)) &&
    typeof value.soundEnabled === 'boolean' &&
    typeof value.wakeLockEnabled === 'boolean' &&
    typeof value.installHelpDismissed === 'boolean' &&
    isFiniteNumber(value.updatedAt)
  );
};

const isSetSession = (value: unknown): value is SetSession => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    isFiniteNumber(value.setNumber) &&
    isNullableNumber(value.loadKg) &&
    isNullableNumber(value.repetitions) &&
    isNullableNumber(value.durationSeconds) &&
    isNullableIntegerInRange(value.rir, 0, 10) &&
    typeof value.completed === 'boolean' &&
    isNullableNumber(value.completedAt)
  );
};

const isExerciseSession = (value: unknown): value is ExerciseSession => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.prescriptionId === 'string' &&
    typeof value.exerciseId === 'string' &&
    isUnknownArray(value.sets) &&
    value.sets.every(isSetSession) &&
    isNullableNumber(value.startedAt) &&
    isNullableNumber(value.completedAt) &&
    typeof value.skipped === 'boolean'
  );
};

const isCardioSession = (value: unknown): value is CardioSession => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.prescriptionId === 'string' &&
    (value.modality === 'treadmill' || value.modality === 'bike') &&
    isFiniteNumber(value.targetDurationSeconds) &&
    isNullableNumber(value.startedAt) &&
    isNullableNumber(value.completedAt) &&
    isNullableNumber(value.durationSeconds) &&
    isNullableNumber(value.distanceKm) &&
    isNullableNumber(value.speedKmh) &&
    isNullableNumber(value.inclinePercent) &&
    isNullableNumber(value.intensityLevel) &&
    isNullableIntegerInRange(value.rpe, 1, 10)
  );
};

const isWorkoutFeedback = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    (value.feeling === null ||
      value.feeling === 'very-heavy' ||
      value.feeling === 'heavy' ||
      value.feeling === 'good' ||
      value.feeling === 'easy') &&
    isNullableIntegerInRange(value.overallRpe, 1, 10) &&
    typeof value.notes === 'string'
  );
};

const isWorkoutSession = (value: unknown): value is WorkoutSession => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    isUserId(value.userId) &&
    isFiniteNumber(value.programWeek) &&
    Number.isInteger(value.programWeek) &&
    value.programWeek >= MIN_PROGRAM_WEEK &&
    value.programWeek <= MAX_PROGRAM_WEEK &&
    typeof value.workoutTemplateId === 'string' &&
    (value.workoutCode === 'A' || value.workoutCode === 'B' || value.workoutCode === 'C') &&
    (value.status === 'active' || value.status === 'completed' || value.status === 'discarded') &&
    isFiniteNumber(value.startedAt) &&
    isFiniteNumber(value.updatedAt) &&
    isNullableNumber(value.completedAt) &&
    isNullableNumber(value.durationSeconds) &&
    isFiniteNumber(value.currentExerciseIndex) &&
    isUnknownArray(value.exercises) &&
    value.exercises.every(isExerciseSession) &&
    (value.cardio === null || isCardioSession(value.cardio)) &&
    (value.feedback === null || isWorkoutFeedback(value.feedback))
  );
};

const isRestTimer = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isFiniteNumber(value.restStartedAt) &&
    isFiniteNumber(value.restDurationSeconds) &&
    isUserId(value.userId) &&
    typeof value.exerciseSessionId === 'string' &&
    typeof value.setSessionId === 'string'
  );
};

const isActiveWorkout = (value: unknown): value is ActiveWorkoutState => {
  if (!isRecord(value) || !isRecord(value.sessions)) {
    return false;
  }

  const participantIdsAreValid =
    isUnknownArray(value.participantIds) && value.participantIds.every(isUserId);
  const lucasSession = value.sessions.lucas;
  const geovannaSession = value.sessions.geovanna;

  return (
    typeof value.id === 'string' &&
    (value.mode === 'solo' || value.mode === 'duo') &&
    participantIdsAreValid &&
    isUserId(value.activeUserId) &&
    (typeof lucasSession === 'undefined' || isWorkoutSession(lucasSession)) &&
    (typeof geovannaSession === 'undefined' || isWorkoutSession(geovannaSession)) &&
    (value.restTimer === null || isRestTimer(value.restTimer)) &&
    isFiniteNumber(value.startedAt) &&
    isFiniteNumber(value.updatedAt)
  );
};

const isExerciseProgress = (value: unknown): value is ExerciseProgressRecord => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    isUserId(value.userId) &&
    typeof value.exerciseId === 'string' &&
    isNullableNumber(value.lastLoadKg) &&
    isNullableNumber(value.bestLoadKg) &&
    isFiniteNumber(value.bestVolumeKg) &&
    isNullableNumber(value.lastRepetitions) &&
    isFiniteNumber(value.updatedAt)
  );
};

const isWeightEntry = (value: unknown): value is WeightEntry => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    isUserId(value.userId) &&
    isFiniteNumber(value.weightKg) &&
    value.weightKg > 0 &&
    value.weightKg <= 500 &&
    isFiniteNumber(value.recordedAt) &&
    isFiniteNumber(value.createdAt)
  );
};

type BackupPayloadBase = Omit<BackupPayload, 'data'> & {
  storageVersion: number;
  data: Omit<BackupPayload['data'], 'weightEntries'> & { weightEntries?: unknown };
};

const hasValidBackupData = (value: unknown): value is BackupPayloadBase => {
  if (!isRecord(value) || !isRecord(value.data)) {
    return false;
  }

  const { data } = value;
  return (
    value.app === 'ritmo-duo' &&
    isFiniteNumber(value.exportedAt) &&
    isUnknownArray(data.users) &&
    data.users.length === 2 &&
    data.users.every(isUserProfile) &&
    data.users.some((user) => user.id === 'lucas') &&
    data.users.some((user) => user.id === 'geovanna') &&
    isPreferences(data.preferences) &&
    isUnknownArray(data.workoutSessions) &&
    data.workoutSessions.every(isWorkoutSession) &&
    (data.activeWorkout === null || isActiveWorkout(data.activeWorkout)) &&
    isUnknownArray(data.exerciseProgress) &&
    data.exerciseProgress.every(isExerciseProgress)
  );
};

const isBackupPayload = (value: unknown): value is BackupPayload =>
  hasValidBackupData(value) &&
  value.storageVersion === STORAGE_VERSION &&
  isUnknownArray(value.data.weightEntries) &&
  value.data.weightEntries.every(isWeightEntry);

const normalizeBackup = (value: unknown): BackupPayload | null => {
  if (isBackupPayload(value)) {
    return value;
  }

  if (hasValidBackupData(value) && value.storageVersion === 1) {
    return {
      ...value,
      storageVersion: STORAGE_VERSION,
      data: {
        ...value.data,
        weightEntries: [],
      },
    };
  }

  return null;
};

export const createBackup = async (exportedAt = Date.now()): Promise<BackupPayload> => {
  const database = await getDatabase();
  const [users, preferences, workoutSessions, storedActiveWorkout, exerciseProgress, weightEntries] =
    await Promise.all([
      database.getAll('users'),
      database.get('preferences', 'app'),
      database.getAll('workoutSessions'),
      database.get('activeWorkout', 'current'),
      database.getAll('exerciseProgress'),
      database.getAll('weightEntries'),
    ]);

  if (!preferences) {
    throw new Error('Preferências locais não puderam ser lidas.');
  }

  return {
    app: 'ritmo-duo',
    storageVersion: STORAGE_VERSION,
    exportedAt,
    data: {
      users,
      preferences,
      workoutSessions,
      activeWorkout: storedActiveWorkout?.state ?? null,
      exerciseProgress,
      weightEntries,
    },
  };
};

export const serializeBackup = (backup: BackupPayload): string => JSON.stringify(backup, null, 2);

const createBackupFile = async (): Promise<Blob> =>
  new Blob([serializeBackup(await createBackup())], { type: 'application/json' });

export const downloadBackup = async (fileName = 'treino-backup.json'): Promise<void> => {
  const blob = await createBackupFile();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.hidden = true;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
};

export const parseBackup = (json: string): BackupPayload => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json) as unknown;
  } catch {
    throw new Error('O arquivo selecionado não contém JSON válido.');
  }

  const backup = normalizeBackup(parsed);
  if (!backup) {
    throw new Error('Backup incompatível, incompleto ou de uma versão não suportada.');
  }

  return backup;
};

export const importBackup = async (
  input: string | BackupPayload,
): Promise<ImportBackupResult> => {
  const backup = typeof input === 'string' ? parseBackup(input) : normalizeBackup(input);
  if (!backup) {
    throw new Error('Backup incompatível, incompleto ou de uma versão não suportada.');
  }

  const database = await getDatabase();
  const transaction = database.transaction(
    ['users', 'preferences', 'workoutSessions', 'activeWorkout', 'exerciseProgress', 'weightEntries'],
    'readwrite',
  );

  await Promise.all([
    transaction.objectStore('users').clear(),
    transaction.objectStore('preferences').clear(),
    transaction.objectStore('workoutSessions').clear(),
    transaction.objectStore('activeWorkout').clear(),
    transaction.objectStore('exerciseProgress').clear(),
    transaction.objectStore('weightEntries').clear(),
  ]);

  await Promise.all([
    ...backup.data.users.map((user) => transaction.objectStore('users').put(user)),
    transaction.objectStore('preferences').put(backup.data.preferences),
    ...backup.data.workoutSessions.map((session) =>
      transaction.objectStore('workoutSessions').put(session),
    ),
    ...backup.data.exerciseProgress.map((progress) =>
      transaction.objectStore('exerciseProgress').put(progress),
    ),
    ...backup.data.weightEntries.map((entry) => transaction.objectStore('weightEntries').put(entry)),
    ...(backup.data.activeWorkout
      ? [
          transaction.objectStore('activeWorkout').put({
            id: 'current',
            state: backup.data.activeWorkout,
          }),
        ]
      : []),
  ]);

  await transaction.done;
  return {
    users: backup.data.users.length,
    workoutSessions: backup.data.workoutSessions.length,
    exerciseProgress: backup.data.exerciseProgress.length,
    weightEntries: backup.data.weightEntries.length,
    restoredActiveWorkout: backup.data.activeWorkout !== null,
  };
};

export const importBackupFile = async (file: File): Promise<ImportBackupResult> =>
  importBackup(await file.text());
