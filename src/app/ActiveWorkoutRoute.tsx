import { getExercise, getWorkoutTemplateById } from '@/data';
import { ActiveWorkoutScreen } from '@/features/active-workout/ActiveWorkoutScreen';
import { notifyRestComplete, unlockFeedbackAudio } from '@/pwa';
import type {
  ActiveWorkoutState,
  ProgressionEquipment,
  UserProfile,
  WorkoutSession,
} from '@/types';
import {
  adjustRestDuration,
  completeActiveWorkoutSet,
  createRestTimer,
  evaluateDoubleProgression,
  getElapsedSeconds,
  getEffectivePrescription,
  switchActiveWorkoutUser,
  updateActiveWorkoutSet,
} from '@/utils';

interface ActiveWorkoutRouteProps {
  state: ActiveWorkoutState;
  profiles: readonly UserProfile[];
  sessions: readonly WorkoutSession[];
  online: boolean;
  soundEnabled: boolean;
  getCurrentWorkout: () => ActiveWorkoutState | null;
  onPersistWorkout: (state: ActiveWorkoutState) => Promise<boolean>;
  onBack: () => void;
  onRequestCompletion: () => void;
  onToast: (message: string) => void;
}

const progressionEquipment = (equipmentTypes: readonly string[]): ProgressionEquipment => {
  if (equipmentTypes.includes('multi-station')) return 'machine';
  if (equipmentTypes.includes('dumbbell')) return 'dumbbell';
  if (equipmentTypes.includes('bodyweight')) return 'bodyweight';
  return 'barbell-lower';
};

export function ActiveWorkoutRoute({
  state,
  profiles,
  sessions,
  online,
  soundEnabled,
  getCurrentWorkout,
  onPersistWorkout,
  onBack,
  onRequestCompletion,
  onToast,
}: ActiveWorkoutRouteProps) {
  const activeSession = state.sessions[state.activeUserId];
  const activeTemplate = activeSession
    ? getWorkoutTemplateById(activeSession.workoutTemplateId)
    : undefined;
  const safeIndex = activeTemplate && activeSession
    ? Math.min(activeSession.currentExerciseIndex, activeTemplate.exercises.length - 1)
    : 0;
  const basePrescription = activeTemplate?.exercises[safeIndex];
  const prescription = basePrescription && activeSession
    ? getEffectivePrescription(basePrescription, activeSession.userId, activeSession.programWeek)
    : undefined;
  const exerciseSession = activeSession?.exercises.find(
    (item) => item.prescriptionId === prescription?.id,
  );
  const exercise = prescription && prescription.kind !== 'cardio'
    ? getExercise(prescription.exerciseId)
    : undefined;
  const activeUserSessions = sessions.filter(
    (session) => session.userId === state.activeUserId && session.status === 'completed',
  );
  const previousSets = exerciseSession
    ? activeUserSessions
        .flatMap((session) => session.exercises)
        .find(
          (item) =>
            item.exerciseId === exerciseSession.exerciseId &&
            item.sets.some((set) => set.completed),
        )
        ?.sets.filter((set) => set.completed)
    : undefined;
  const progressionSuggestion =
    prescription?.kind === 'strength' && exerciseSession && exercise
      ? evaluateDoubleProgression(prescription, exerciseSession.sets, {
          equipment:
            exercise.equipmentTypes.includes('bodyweight') &&
            exerciseSession.sets.every((set) => set.loadKg === null || set.loadKg === 0)
              ? 'bodyweight'
              : progressionEquipment(exercise.equipmentTypes),
        })
      : undefined;

  const changeSession = (mutate: (session: WorkoutSession) => WorkoutSession) => {
    const current = getCurrentWorkout();
    const currentSession = current?.sessions[current.activeUserId];
    if (!current || !currentSession) return null;
    const nextSession = mutate(currentSession);
    return {
      ...current,
      sessions: { ...current.sessions, [current.activeUserId]: nextSession },
      updatedAt: Date.now(),
    };
  };

  if (!activeTemplate || !activeSession || !prescription) {
    return null;
  }

  return (
    <ActiveWorkoutScreen
      state={state}
      profiles={profiles}
      template={activeTemplate}
      prescription={prescription}
      exercise={exercise}
      exerciseSession={exerciseSession}
      previousSets={previousSets}
      restTimer={state.restTimer}
      online={online}
      progressionSuggestion={progressionSuggestion}
      onBack={onBack}
      onSwitchUser={(userId) => {
        const current = getCurrentWorkout();
        if (current) void onPersistWorkout(switchActiveWorkoutUser(current, userId));
      }}
      onSetChange={(setId, changes) => {
        const current = getCurrentWorkout();
        const currentSession = current?.sessions[current.activeUserId];
        const targetExercise = currentSession?.exercises.find(
          (item) => item.prescriptionId === prescription.id,
        );
        const targetSet = targetExercise?.sets.find((set) => set.id === setId);
        if (!current || !currentSession || !targetExercise || !targetSet) return;

        const exerciseAllowsBodyweight = exercise?.equipmentTypes.includes('bodyweight') ?? false;
        const measure = prescription.kind === 'carry'
          ? changes.durationSeconds
          : changes.repetitions;
        const minimumEffort = prescription.kind === 'carry' ? 1 : 0;
        const effortValid =
          changes.rir !== null &&
          Number.isInteger(changes.rir) &&
          changes.rir >= minimumEffort &&
          changes.rir <= 10;
        const valid =
          (exerciseAllowsBodyweight || (changes.loadKg !== null && changes.loadKg > 0)) &&
          measure !== null &&
          measure > 0 &&
          effortValid;
        const patch = targetSet.completed && !valid
          ? { ...changes, completed: false, completedAt: null }
          : changes;
        let next = updateActiveWorkoutSet(
          current,
          current.activeUserId,
          targetExercise.id,
          setId,
          patch,
        );
        if (!valid && next.restTimer?.setSessionId === setId) {
          next = { ...next, restTimer: null, updatedAt: Date.now() };
        }
        void onPersistWorkout(next);
      }}
      onSetComplete={(setId) => {
        if (soundEnabled) void unlockFeedbackAudio();
        const current = getCurrentWorkout();
        const currentSession = current?.sessions[current.activeUserId];
        const targetExercise = currentSession?.exercises.find(
          (item) => item.prescriptionId === prescription.id,
        );
        const targetSet = targetExercise?.sets.find((set) => set.id === setId);
        if (!current || !currentSession || !targetExercise || !targetSet) return;

        const next = targetSet.completed
          ? {
              ...updateActiveWorkoutSet(
                current,
                current.activeUserId,
                targetExercise.id,
                setId,
                { completed: false, completedAt: null },
              ),
              restTimer: current.restTimer?.setSessionId === setId ? null : current.restTimer,
            }
          : {
              ...completeActiveWorkoutSet(
                current,
                current.activeUserId,
                targetExercise.id,
                setId,
              ),
              restTimer: createRestTimer({
                durationSeconds:
                  prescription.kind === 'cardio' ? 0 : prescription.restSeconds,
                userId: current.activeUserId,
                exerciseSessionId: targetExercise.id,
                setSessionId: setId,
              }),
            };
        void onPersistWorkout(next);
      }}
      onPreviousExercise={() => {
        const next = changeSession((session) => ({
          ...session,
          currentExerciseIndex: Math.max(0, session.currentExerciseIndex - 1),
          updatedAt: Date.now(),
        }));
        if (next) void onPersistWorkout(next);
      }}
      onNextExercise={() => {
        const next = changeSession((session) => ({
          ...session,
          currentExerciseIndex: Math.min(
            activeTemplate.exercises.length - 1,
            session.currentExerciseIndex + 1,
          ),
          updatedAt: Date.now(),
        }));
        if (next) void onPersistWorkout(next);
      }}
      onFinish={onRequestCompletion}
      onRestAdjust={(seconds) => {
        const current = getCurrentWorkout();
        if (current?.restTimer) {
          void onPersistWorkout({
            ...current,
            restTimer: adjustRestDuration(current.restTimer, seconds),
            updatedAt: Date.now(),
          });
        }
      }}
      onRestSkip={() => {
        const current = getCurrentWorkout();
        if (current) {
          void onPersistWorkout({ ...current, restTimer: null, updatedAt: Date.now() });
        }
      }}
      onRestFinished={() => {
        const current = getCurrentWorkout();
        if (!current?.restTimer) return;
        notifyRestComplete({ vibrate: true, sound: soundEnabled });
        onToast('Descanso concluído.');
        void onPersistWorkout({ ...current, restTimer: null, updatedAt: Date.now() });
      }}
      onCardioStart={() => {
        if (activeSession.cardio?.startedAt || activeSession.cardio?.completedAt) return;
        const next = changeSession((session) => ({
          ...session,
          cardio: session.cardio ? { ...session.cardio, startedAt: Date.now() } : null,
          updatedAt: Date.now(),
        }));
        if (next) void onPersistWorkout(next);
      }}
      onCardioUpdate={(changes) => {
        const next = changeSession((session) => ({
          ...session,
          cardio: session.cardio ? { ...session.cardio, ...changes } : null,
          updatedAt: Date.now(),
        }));
        if (next) void onPersistWorkout(next);
      }}
      onCardioComplete={() => {
        if (activeSession.cardio?.completedAt) return;
        const completedAt = Date.now();
        const next = changeSession((session) => ({
          ...session,
          cardio: session.cardio
            ? {
                ...session.cardio,
                completedAt,
                durationSeconds: session.cardio.startedAt
                  ? getElapsedSeconds(session.cardio.startedAt, completedAt)
                  : session.cardio.durationSeconds,
              }
            : null,
          updatedAt: completedAt,
        }));
        if (next) {
          void onPersistWorkout(next);
          onToast('Cardio concluído.');
        }
      }}
    />
  );
}
