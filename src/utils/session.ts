import type {
  ActiveWorkoutState,
  CardioPrescription,
  CardioSession,
  ExerciseSession,
  SetSession,
  SetSessionPatch,
  UserId,
  WorkoutSession,
  WorkoutTemplate,
} from '@/types';
import { createId } from './id';
import {
  getEffectiveCardioTargetSeconds,
  getEffectiveSetCount,
  normalizeProgramWeek,
} from './training-phase';

export interface CreateWorkoutSessionOptions {
  now?: number;
  programWeek?: number;
  includeOptionalThirdSet?: boolean;
}

const createSet = (exerciseSessionId: string, setNumber: number): SetSession => ({
  id: `${exerciseSessionId}-set-${setNumber}`,
  setNumber,
  loadKg: null,
  repetitions: null,
  durationSeconds: null,
  rir: null,
  completed: false,
  completedAt: null,
});

const createExerciseSession = (
  template: WorkoutTemplate,
  prescription: Extract<WorkoutTemplate['exercises'][number], { kind: 'strength' | 'carry' }>,
  options: CreateWorkoutSessionOptions,
): ExerciseSession => {
  const exerciseSessionId = createId(`exercise-${prescription.exerciseId}`, options.now);
  const setCount = getEffectiveSetCount(
    prescription.sets,
    template.userId,
    prescription.exerciseId,
    options.programWeek ?? 1,
    options.includeOptionalThirdSet,
  );

  return {
    id: exerciseSessionId,
    prescriptionId: prescription.id,
    exerciseId: prescription.exerciseId,
    sets: Array.from({ length: setCount }, (_, index) => createSet(exerciseSessionId, index + 1)),
    startedAt: null,
    completedAt: null,
    skipped: false,
  };
};

const createCardioSession = (
  prescription: CardioPrescription,
  userId: UserId,
  now: number,
  programWeek: number,
): CardioSession => ({
  id: createId(`cardio-${prescription.modality}`, now),
  prescriptionId: prescription.id,
  modality: prescription.modality,
  targetDurationSeconds: getEffectiveCardioTargetSeconds(prescription, userId, programWeek),
  startedAt: null,
  completedAt: null,
  durationSeconds: null,
  distanceKm: null,
  speedKmh: null,
  inclinePercent: null,
  intensityLevel: null,
  rpe: null,
});

export const createWorkoutSession = (
  template: WorkoutTemplate,
  options: CreateWorkoutSessionOptions = {},
): WorkoutSession => {
  const now = options.now ?? Date.now();
  const programWeek = normalizeProgramWeek(options.programWeek ?? 1);
  const exercisePrescriptions = template.exercises.filter(
    (prescription) => prescription.kind === 'strength' || prescription.kind === 'carry',
  );
  const cardioPrescription = template.exercises.find(
    (prescription): prescription is CardioPrescription => prescription.kind === 'cardio',
  );

  return {
    id: createId(`session-${template.userId}-${template.code.toLowerCase()}`, now),
    userId: template.userId,
    programWeek,
    workoutTemplateId: template.id,
    workoutCode: template.code,
    status: 'active',
    startedAt: now,
    updatedAt: now,
    completedAt: null,
    durationSeconds: null,
    currentExerciseIndex: 0,
    exercises: exercisePrescriptions.map((prescription) =>
      createExerciseSession(template, prescription, { ...options, now }),
    ),
    cardio: cardioPrescription
      ? createCardioSession(cardioPrescription, template.userId, now, programWeek)
      : null,
    feedback: null,
  };
};

export interface CreateActiveWorkoutOptions extends CreateWorkoutSessionOptions {
  activeUserId?: UserId;
  programWeekByUserId?: Partial<Record<UserId, number>>;
}

export const createActiveWorkout = (
  templates: WorkoutTemplate[],
  options: CreateActiveWorkoutOptions = {},
): ActiveWorkoutState => {
  if (templates.length === 0 || templates.length > 2) {
    throw new Error('Um treino ativo precisa ter um ou dois participantes.');
  }

  const participantIds = templates.map((template) => template.userId);
  if (new Set(participantIds).size !== participantIds.length) {
    throw new Error('Cada participante só pode aparecer uma vez no treino ativo.');
  }

  const activeUserId = options.activeUserId ?? participantIds[0];
  if (!activeUserId || !participantIds.includes(activeUserId)) {
    throw new Error('O usuário ativo precisa fazer parte do treino.');
  }

  const now = options.now ?? Date.now();
  const sessions: Partial<Record<UserId, WorkoutSession>> = {};
  templates.forEach((template) => {
    sessions[template.userId] = createWorkoutSession(template, {
      ...options,
      programWeek: options.programWeekByUserId?.[template.userId] ?? options.programWeek,
      now,
    });
  });

  return {
    id: createId('active-workout', now),
    mode: templates.length === 2 ? 'duo' : 'solo',
    participantIds,
    activeUserId,
    sessions,
    restTimer: null,
    startedAt: now,
    updatedAt: now,
  };
};

export const updateActiveWorkoutSet = (
  state: ActiveWorkoutState,
  userId: UserId,
  exerciseSessionId: string,
  setSessionId: string,
  patch: SetSessionPatch,
  now = Date.now(),
): ActiveWorkoutState => {
  const session = state.sessions[userId];
  if (!session) {
    throw new Error('Sessão do usuário não encontrada no treino ativo.');
  }

  let foundExercise = false;
  let foundSet = false;
  const exercises = session.exercises.map((exercise) => {
    if (exercise.id !== exerciseSessionId) {
      return exercise;
    }

    foundExercise = true;
    return {
      ...exercise,
      startedAt: exercise.startedAt ?? now,
      sets: exercise.sets.map((set) => {
        if (set.id !== setSessionId) {
          return set;
        }
        foundSet = true;
        return { ...set, ...patch };
      }),
    };
  });

  if (!foundExercise || !foundSet) {
    throw new Error('Exercício ou série não encontrado no treino ativo.');
  }

  return {
    ...state,
    sessions: {
      ...state.sessions,
      [userId]: { ...session, exercises, updatedAt: now },
    },
    updatedAt: now,
  };
};

export const completeActiveWorkoutSet = (
  state: ActiveWorkoutState,
  userId: UserId,
  exerciseSessionId: string,
  setSessionId: string,
  now = Date.now(),
): ActiveWorkoutState =>
  updateActiveWorkoutSet(
    state,
    userId,
    exerciseSessionId,
    setSessionId,
    { completed: true, completedAt: now },
    now,
  );

export const switchActiveWorkoutUser = (
  state: ActiveWorkoutState,
  userId: UserId,
  now = Date.now(),
): ActiveWorkoutState => {
  if (!state.participantIds.includes(userId)) {
    throw new Error('O usuário selecionado não participa deste treino.');
  }

  return { ...state, activeUserId: userId, updatedAt: now };
};
