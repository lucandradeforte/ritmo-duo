import { RotateCcw } from 'lucide-react';
import {
  useCallback,
  useEffect,
  lazy,
  useMemo,
  useRef,
  useState,
  Suspense,
  type ReactNode,
} from 'react';
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { BottomNavigation, type BottomNavigationItemId } from '@/components/navigation/BottomNavigation';
import { BrandMark } from '@/components/brand/BrandMark';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  getExercise,
  getWorkoutPlan,
  getWorkoutTemplate,
  getWorkoutTemplateById,
  users as seedUsers,
} from '@/data';
import { ActiveWorkoutScreen } from '@/features/active-workout/ActiveWorkoutScreen';
import { EMPTY_WORKOUT_FEEDBACK } from '@/features/active-workout/workout-feedback';
import { ProfileSelectScreen } from '@/features/users/ProfileSelectScreen';
import { TodayScreen } from '@/features/workouts/TodayScreen';
import {
  notifyRestComplete,
  PwaStatusCenter,
  unlockFeedbackAudio,
  useOnlineStatus,
  useWakeLock,
} from '@/pwa';
import {
  clearExerciseProgress,
  clearWorkoutHistory,
  completeActiveWorkout,
  discardActiveWorkout,
  downloadBackup,
  getActiveWorkout,
  getPreferences,
  importBackupFile,
  initializeStorage,
  listExerciseProgress,
  listUserProfiles,
  listWorkoutSessions,
  saveActiveWorkout,
  updatePreferences,
} from '@/storage';
import type {
  ActiveWorkoutState,
  AppPreferences,
  ExerciseProgressRecord,
  ProgressionEquipment,
  ThemePreference,
  UserId,
  UserProfile,
  WorkoutSession,
  WorkoutTemplate,
  WorkoutFeedback,
} from '@/types';
import {
  adjustRestDuration,
  calculateProgramWeekFromHistory,
  calculateSessionVolume,
  completeActiveWorkoutSet,
  createActiveWorkout,
  createRestTimer,
  evaluateDoubleProgression,
  formatClock,
  getElapsedSeconds,
  getEffectivePrescription,
  getPendingParticipantIds,
  switchActiveWorkoutUser,
  updateActiveWorkoutSet,
} from '@/utils';
import styles from './App.module.css';

const WorkoutsScreen = lazy(async () => ({
  default: (await import('@/features/workouts/WorkoutsScreen')).WorkoutsScreen,
}));
const WorkoutDetail = lazy(async () => ({
  default: (await import('@/features/workouts/WorkoutDetail')).WorkoutDetail,
}));
const HistoryScreen = lazy(async () => ({
  default: (await import('@/features/history/HistoryScreen')).HistoryScreen,
}));
const SessionDetail = lazy(async () => ({
  default: (await import('@/features/history/SessionDetail')).SessionDetail,
}));
const ProgressScreen = lazy(async () => ({
  default: (await import('@/features/progress/ProgressScreen')).ProgressScreen,
}));
const ProfileScreen = lazy(async () => ({
  default: (await import('@/features/settings/ProfileScreen')).ProfileScreen,
}));
const WorkoutCompletion = lazy(async () => ({
  default: (await import('@/features/active-workout/WorkoutCompletion')).WorkoutCompletion,
}));

const ROUTES: Record<BottomNavigationItemId, string> = {
  today: '/today',
  workouts: '/workouts',
  history: '/history',
  progress: '/progress',
  profile: '/profile',
};

const ROUTE_IDS = Object.entries(ROUTES) as Array<[BottomNavigationItemId, string]>;

const getRouteId = (pathname: string): BottomNavigationItemId =>
  ROUTE_IDS.find(([, path]) => pathname.startsWith(path))?.[0] ?? 'today';

const getWeekStart = (timestamp: number): number => {
  const date = new Date(timestamp);
  const day = date.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysSinceMonday);
  return date.getTime();
};

const suggestedWorkout = (
  templates: readonly WorkoutTemplate[],
  sessions: readonly WorkoutSession[],
  timestamp: number,
): WorkoutTemplate => {
  const codeByDay = new Map<number, WorkoutTemplate['code']>([
    [2, 'A'],
    [4, 'B'],
    [5, 'C'],
  ]);
  const todayCode = codeByDay.get(new Date(timestamp).getDay());
  const lastCode = sessions[0]?.workoutCode;
  const fallbackCode = lastCode === 'A' ? 'B' : lastCode === 'B' ? 'C' : 'A';
  return templates.find((template) => template.code === (todayCode ?? fallbackCode)) ?? templates[0]!;
};

const progressionEquipment = (equipmentTypes: readonly string[]): ProgressionEquipment => {
  if (equipmentTypes.includes('multi-station')) return 'machine';
  if (equipmentTypes.includes('dumbbell')) return 'dumbbell';
  if (equipmentTypes.includes('bodyweight')) return 'bodyweight';
  return 'barbell-lower';
};

const isReadyForOptionalVolume = (sessions: readonly WorkoutSession[]): boolean => {
  const recentLucasSessions = sessions
    .filter((session) => session.userId === 'lucas' && session.status === 'completed')
    .slice(0, 3);
  return (
    recentLucasSessions.length === 3 &&
    recentLucasSessions.every(
      (session) =>
        (session.feedback?.feeling === 'good' || session.feedback?.feeling === 'easy') &&
        (session.feedback.overallRpe === null || session.feedback.overallRpe <= 7),
    )
  );
};

interface LoadState {
  preferences: AppPreferences;
  profiles: UserProfile[];
  sessions: WorkoutSession[];
  progress: ExerciseProgressRecord[];
  activeWorkout: ActiveWorkoutState | null;
}

type PersistenceState = 'idle' | 'saving' | 'error';

const loadAppState = async (): Promise<LoadState> => {
  await initializeStorage();
  const [preferences, profiles, sessions, progress, activeWorkout] = await Promise.all([
    getPreferences(),
    listUserProfiles(),
    listWorkoutSessions(),
    listExerciseProgress(),
    getActiveWorkout(),
  ]);
  return {
    preferences,
    profiles: profiles.length > 0 ? profiles : [...seedUsers],
    sessions,
    progress,
    activeWorkout,
  };
};

function RouteFrame({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="app-shell">
      {children}
      <BottomNavigation
        activeItem={getRouteId(location.pathname)}
        onItemSelect={(item) => void navigate(ROUTES[item])}
      />
    </div>
  );
}

function AppController() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<AppPreferences | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([...seedUsers]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [progress, setProgress] = useState<ExerciseProgressRecord[]>([]);
  const [activeWorkout, setActiveWorkoutState] = useState<ActiveWorkoutState | null>(null);
  const activeWorkoutRef = useRef<ActiveWorkoutState | null>(null);
  const [now, setNow] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [selectedWorkoutDetail, setSelectedWorkoutDetail] = useState<WorkoutTemplate | null>(null);
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<WorkoutSession | null>(null);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [completionUserId, setCompletionUserId] = useState<UserId | null>(null);
  const [completionFeedback, setCompletionFeedback] = useState<WorkoutFeedback>({
    ...EMPTY_WORKOUT_FEEDBACK,
  });
  const [savingCompletion, setSavingCompletion] = useState(false);
  const [persistenceState, setPersistenceState] = useState<PersistenceState>('idle');
  const activeWriteQueueRef = useRef<Promise<void>>(Promise.resolve());
  const persistSequenceRef = useRef(0);
  const online = useOnlineStatus();

  const refreshState = useCallback(async () => {
    const next = await loadAppState();
    setPreferences(next.preferences);
    setProfiles(next.profiles);
    setSessions(next.sessions);
    setProgress(next.progress);
    activeWorkoutRef.current = next.activeWorkout;
    setActiveWorkoutState(next.activeWorkout);
    setRecoveryOpen(next.activeWorkout !== null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void loadAppState()
      .then((next) => {
        if (cancelled) return;
        setPreferences(next.preferences);
        setProfiles(next.profiles);
        setSessions(next.sessions);
        setProgress(next.progress);
        activeWorkoutRef.current = next.activeWorkout;
        setActiveWorkoutState(next.activeWorkout);
        setRecoveryOpen(next.activeWorkout !== null);
        setNow(Date.now());
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setFatalError(error instanceof Error ? error.message : 'Não foi possível abrir os dados locais.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), activeWorkout ? 1_000 : 60_000);
    const sync = () => setNow(Date.now());
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('focus', sync);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('focus', sync);
    };
  }, [activeWorkout]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(null), 3_200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!preferences) return;
    const root = document.documentElement;
    if (preferences.theme === 'system') root.removeAttribute('data-theme');
    else root.dataset.theme = preferences.theme;
    const light =
      preferences.theme === 'light' ||
      (preferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches);
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', light ? '#f4f6f1' : '#080a09');
  }, [preferences]);

  useWakeLock({
    enabled: preferences?.wakeLockEnabled ?? false,
    workoutActive: activeWorkout !== null,
  });

  const selectedUserId = preferences?.lastUserId ?? null;
  const selectedUser = profiles.find((profile) => profile.id === selectedUserId) ?? null;
  const userSessions = useMemo(
    () => sessions.filter((session) => session.userId === selectedUserId && session.status === 'completed'),
    [selectedUserId, sessions],
  );
  const userProgress = useMemo(
    () => progress.filter((record) => record.userId === selectedUserId),
    [progress, selectedUserId],
  );

  const persistActive = useCallback((next: ActiveWorkoutState): Promise<boolean> => {
    activeWorkoutRef.current = next;
    setActiveWorkoutState(next);
    const sequence = ++persistSequenceRef.current;
    setPersistenceState('saving');

    const result = activeWriteQueueRef.current
      .then(() => saveActiveWorkout(next))
      .then(() => {
        if (sequence === persistSequenceRef.current) setPersistenceState('idle');
        return true;
      })
      .catch(() => {
        if (sequence === persistSequenceRef.current) setPersistenceState('error');
        return false;
      });

    activeWriteQueueRef.current = result.then(() => undefined);
    return result;
  }, []);

  const updatePreference = useCallback(async (patch: Partial<Omit<AppPreferences, 'id' | 'updatedAt'>>) => {
    const next = await updatePreferences(patch);
    setPreferences(next);
    return next;
  }, []);

  const handleSelectProfile = useCallback(
    async (userId: UserId) => {
      await updatePreference({ lastUserId: userId });
      void navigate('/today');
    },
    [navigate, updatePreference],
  );

  const handleStart = useCallback(
    async (template: WorkoutTemplate, duo = false) => {
      setSelectedWorkoutDetail(null);
      if (activeWorkoutRef.current) {
        setRecoveryOpen(true);
        setToast('Conclua ou descarte o treino em andamento antes de iniciar outro.');
        return;
      }
      if (preferences?.soundEnabled) {
        await unlockFeedbackAudio();
      }
      const templates = [template];
      if (duo) {
        const partnerId: UserId = template.userId === 'lucas' ? 'geovanna' : 'lucas';
        const partnerTemplate = getWorkoutTemplate(partnerId, template.code);
        if (partnerTemplate) templates.push(partnerTemplate);
      }
      const programWeekByUserId = Object.fromEntries(
        templates.map((item) => [
          item.userId,
          calculateProgramWeekFromHistory(sessions, item.userId),
        ]),
      );
      const next = createActiveWorkout(templates, {
        activeUserId: template.userId,
        programWeekByUserId,
        includeOptionalThirdSet: isReadyForOptionalVolume(sessions),
      });
      await persistActive(next);
      setRecoveryOpen(false);
      void navigate('/active');
    },
    [navigate, persistActive, preferences?.soundEnabled, sessions],
  );

  const discardCurrent = useCallback(async () => {
    await activeWriteQueueRef.current;
    await discardActiveWorkout();
    persistSequenceRef.current += 1;
    setPersistenceState('idle');
    activeWorkoutRef.current = null;
    setActiveWorkoutState(null);
    setRecoveryOpen(false);
    setToast('Treino em andamento descartado.');
    void navigate('/today');
  }, [navigate]);

  const requestCompletion = useCallback(() => {
    const current = activeWorkoutRef.current;
    if (!current) return;
    const userId = current.activeUserId;
    const currentSession = current.sessions[userId];
    if (!currentSession || (currentSession.cardio && currentSession.cardio.completedAt === null)) {
      setToast('Conclua o cardio antes de finalizar este treino.');
      return;
    }
    setCompletionUserId(userId);
    setCompletionFeedback({
      ...(current.sessions[userId]?.feedback ?? EMPTY_WORKOUT_FEEDBACK),
    });
    setCompletionOpen(true);
  }, []);

  const confirmCompletion = useCallback(
    async (feedback: WorkoutFeedback) => {
      const current = activeWorkoutRef.current;
      const userId = completionUserId;
      const currentSession = userId ? current?.sessions[userId] : undefined;
      if (!current || !userId || !currentSession) return;

      setSavingCompletion(true);
      try {
        const next: ActiveWorkoutState = {
          ...current,
          sessions: {
            ...current.sessions,
            [userId]: { ...currentSession, feedback, updatedAt: Date.now() },
          },
          updatedAt: Date.now(),
        };
        const feedbackSaved = await persistActive(next);
        if (!feedbackSaved) {
          setToast('O feedback ainda não foi salvo. Tente novamente antes de concluir.');
          return;
        }

        const nextParticipant = getPendingParticipantIds(next).find(
          (participantId) => participantId !== userId,
        );
        if (nextParticipant) {
          const switched = switchActiveWorkoutUser(
            { ...next, restTimer: null, updatedAt: Date.now() },
            nextParticipant,
          );
          await persistActive(switched);
          setCompletionOpen(false);
          setCompletionUserId(null);
          setCompletionFeedback({ ...EMPTY_WORKOUT_FEEDBACK });
          setToast(
            `${profiles.find((profile) => profile.id === userId)?.name ?? 'Participante'} concluiu. Continue o treino de ${profiles.find((profile) => profile.id === nextParticipant)?.name ?? 'outro perfil'}.`,
          );
          void navigate('/active');
          return;
        }

        const pendingParticipant = getPendingParticipantIds(next)[0];
        if (pendingParticipant) {
          setToast('Ainda existe um participante com treino pendente.');
          return;
        }

        await completeActiveWorkout();
        persistSequenceRef.current += 1;
        setPersistenceState('idle');
        activeWorkoutRef.current = null;
        setActiveWorkoutState(null);
        setCompletionOpen(false);
        setCompletionUserId(null);
        setRecoveryOpen(false);
        await refreshState();
        setToast('Treino concluído e salvo.');
        void navigate('/history');
      } catch {
        setToast('Não foi possível concluir o treino. Seus registros permanecem salvos.');
      } finally {
        setSavingCompletion(false);
      }
    },
    [completionUserId, navigate, persistActive, profiles, refreshState],
  );

  if (loading) {
    return (
      <main className={styles.loading}>
        <div><span className={styles.brandMark}><BrandMark /></span><strong>Preparando seus treinos…</strong></div>
      </main>
    );
  }

  if (fatalError || !preferences) {
    return (
      <main className={styles.fatal}>
        <div>
          <span className={styles.brandMark}><BrandMark /></span>
          <h1>Não foi possível abrir o Ritmo Duo</h1>
          <p>{fatalError ?? 'As preferências locais não foram carregadas.'}</p>
          <Button leadingIcon={<RotateCcw />} onClick={() => window.location.reload()}>Tentar novamente</Button>
        </div>
      </main>
    );
  }

  if (!selectedUser) {
    return (
      <>
        <ProfileSelectScreen profiles={profiles} onSelect={(userId) => void handleSelectProfile(userId)} />
        <PwaStatusCenter
          installHelpDismissed={preferences.installHelpDismissed}
          workoutActive={activeWorkout !== null}
          onDismissInstallHelp={() => void updatePreference({ installHelpDismissed: true })}
        />
      </>
    );
  }

  const plan = getWorkoutPlan(selectedUser.id);
  const nextWorkout = suggestedWorkout(plan.templates, userSessions, now);
  const weekStart = getWeekStart(now);
  const completedThisWeek = userSessions.filter((session) => session.startedAt >= weekStart).length;
  const activeElapsed = activeWorkout ? formatClock(getElapsedSeconds(activeWorkout.startedAt, now)) : undefined;
  const currentDate = new Date(now);
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getTime();
  const recentStart = now - 28 * 24 * 60 * 60 * 1_000;
  const progressRows = userProgress.map((record) => ({
    exerciseName: getExercise(record.exerciseId)?.name ?? record.exerciseId,
    currentLoadKg: record.lastLoadKg,
    bestLoadKg: record.bestLoadKg,
    trendPercent: 0,
  }));

  let activeScreen: ReactNode = null;
  if (activeWorkout) {
    const activeSession = activeWorkout.sessions[activeWorkout.activeUserId];
    const activeTemplate = activeSession ? getWorkoutTemplateById(activeSession.workoutTemplateId) : undefined;
    const safeIndex = activeTemplate && activeSession
      ? Math.min(activeSession.currentExerciseIndex, activeTemplate.exercises.length - 1)
      : 0;
    const basePrescription = activeTemplate?.exercises[safeIndex];
    const prescription = basePrescription && activeSession
      ? getEffectivePrescription(basePrescription, activeSession.userId, activeSession.programWeek)
      : undefined;
    const exerciseSession = activeSession?.exercises.find((item) => item.prescriptionId === prescription?.id);
    const exercise = prescription && prescription.kind !== 'cardio' ? getExercise(prescription.exerciseId) : undefined;
    const activeUserSessions = sessions.filter(
      (session) => session.userId === activeWorkout.activeUserId && session.status === 'completed',
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
    const cardioElapsed = activeSession?.cardio?.startedAt
      ? getElapsedSeconds(activeSession.cardio.startedAt, now, activeSession.cardio.completedAt)
      : activeSession?.cardio?.durationSeconds ?? 0;
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
      const current = activeWorkoutRef.current;
      const currentSession = current?.sessions[current.activeUserId];
      if (!current || !currentSession) return null;
      const nextSession = mutate(currentSession);
      return {
        ...current,
        sessions: { ...current.sessions, [current.activeUserId]: nextSession },
        updatedAt: Date.now(),
      };
    };

    if (activeTemplate && activeSession && prescription) {
      activeScreen = (
        <ActiveWorkoutScreen
          state={activeWorkout}
          profiles={profiles}
          template={activeTemplate}
          prescription={prescription}
          exercise={exercise}
          exerciseSession={exerciseSession}
          previousSets={previousSets}
          restTimer={activeWorkout.restTimer}
          elapsedLabel={formatClock(getElapsedSeconds(activeWorkout.startedAt, now))}
          cardioElapsedSeconds={cardioElapsed}
          online={online}
          progressionSuggestion={progressionSuggestion}
          onBack={() => void navigate('/today')}
          onSwitchUser={(userId) => {
            const current = activeWorkoutRef.current;
            if (current) void persistActive(switchActiveWorkoutUser(current, userId));
          }}
          onSetChange={(setId, changes) => {
            const current = activeWorkoutRef.current;
            const currentSession = current?.sessions[current.activeUserId];
            const targetExercise = currentSession?.exercises.find((item) => item.prescriptionId === prescription.id);
            const targetSet = targetExercise?.sets.find((set) => set.id === setId);
            if (current && currentSession && targetExercise && targetSet) {
              const exerciseAllowsBodyweight = exercise?.equipmentTypes.includes('bodyweight') ?? false;
              const measure = prescription.kind === 'carry' ? changes.durationSeconds : changes.repetitions;
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
              void persistActive(next);
            }
          }}
          onSetComplete={(setId) => {
            if (preferences.soundEnabled) void unlockFeedbackAudio();
            const current = activeWorkoutRef.current;
            const currentSession = current?.sessions[current.activeUserId];
            const targetExercise = currentSession?.exercises.find((item) => item.prescriptionId === prescription.id);
            const targetSet = targetExercise?.sets.find((set) => set.id === setId);
            if (!current || !currentSession || !targetExercise || !targetSet) return;
            const next = targetSet.completed
              ? {
                  ...updateActiveWorkoutSet(current, current.activeUserId, targetExercise.id, setId, {
                    completed: false,
                    completedAt: null,
                  }),
                  restTimer: current.restTimer?.setSessionId === setId ? null : current.restTimer,
                }
              : {
                  ...completeActiveWorkoutSet(current, current.activeUserId, targetExercise.id, setId),
                  restTimer: createRestTimer({
                    durationSeconds: prescription.kind === 'cardio' ? 0 : prescription.restSeconds,
                    userId: current.activeUserId,
                    exerciseSessionId: targetExercise.id,
                    setSessionId: setId,
                  }),
                };
            void persistActive(next);
          }}
          onPreviousExercise={() => {
            const next = changeSession((session) => ({
              ...session,
              currentExerciseIndex: Math.max(0, session.currentExerciseIndex - 1),
              updatedAt: Date.now(),
            }));
            if (next) void persistActive(next);
          }}
          onNextExercise={() => {
            const next = changeSession((session) => ({
              ...session,
              currentExerciseIndex: Math.min(activeTemplate.exercises.length - 1, session.currentExerciseIndex + 1),
              updatedAt: Date.now(),
            }));
            if (next) void persistActive(next);
          }}
          onFinish={requestCompletion}
          onRestAdjust={(seconds) => {
            const current = activeWorkoutRef.current;
            if (current?.restTimer) void persistActive({ ...current, restTimer: adjustRestDuration(current.restTimer, seconds), updatedAt: Date.now() });
          }}
          onRestSkip={() => {
            const current = activeWorkoutRef.current;
            if (current) void persistActive({ ...current, restTimer: null, updatedAt: Date.now() });
          }}
          onRestFinished={() => {
            const current = activeWorkoutRef.current;
            if (!current?.restTimer) return;
            notifyRestComplete({ vibrate: true, sound: preferences.soundEnabled });
            setToast('Descanso concluído.');
            void persistActive({ ...current, restTimer: null, updatedAt: Date.now() });
          }}
          onCardioStart={() => {
            if (activeSession.cardio?.startedAt || activeSession.cardio?.completedAt) return;
            const next = changeSession((session) => ({
              ...session,
              cardio: session.cardio ? { ...session.cardio, startedAt: Date.now() } : null,
              updatedAt: Date.now(),
            }));
            if (next) void persistActive(next);
          }}
          onCardioUpdate={(changes) => {
            const next = changeSession((session) => ({
              ...session,
              cardio: session.cardio ? { ...session.cardio, ...changes } : null,
              updatedAt: Date.now(),
            }));
            if (next) void persistActive(next);
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
              void persistActive(next);
              setToast('Cardio concluído.');
            }
          }}
        />
      );
    }
  }

  return (
    <>
      <Suspense fallback={<div className={styles.routeLoading} role="status">Carregando…</div>}>
        <Routes>
        <Route
          path="/today"
          element={
            <RouteFrame>
              <TodayScreen
                user={selectedUser}
                workout={nextWorkout}
                lastSession={userSessions[0]}
                completedThisWeek={completedThisWeek}
                activeWorkoutElapsed={activeElapsed}
                activeWorkoutCode={
                  activeWorkout?.sessions[selectedUser.id]?.workoutCode ??
                  activeWorkout?.sessions[activeWorkout.activeUserId]?.workoutCode
                }
                onStart={() => void handleStart(nextWorkout)}
                onStartDuo={() => void handleStart(nextWorkout, true)}
                onContinue={() => {
                  if (preferences.soundEnabled) void unlockFeedbackAudio();
                  setRecoveryOpen(false);
                  void navigate('/active');
                }}
              />
            </RouteFrame>
          }
        />
        <Route
          path="/workouts"
          element={
            <RouteFrame>
              <WorkoutsScreen
                workouts={plan.templates}
                onStart={(workout) => void handleStart(workout)}
                onView={setSelectedWorkoutDetail}
              />
            </RouteFrame>
          }
        />
        <Route
          path="/history"
          element={
            <RouteFrame>
              <HistoryScreen
                sessions={userSessions}
                onOpen={setSelectedSessionDetail}
                getVolume={calculateSessionVolume}
              />
            </RouteFrame>
          }
        />
        <Route
          path="/progress"
          element={
            <RouteFrame>
              <ProgressScreen
                completedCount={userSessions.length}
                monthlyCount={userSessions.filter((session) => session.startedAt >= monthStart).length}
                totalVolumeKg={userSessions.reduce((total, session) => total + calculateSessionVolume(session), 0)}
                consistencyPercent={Math.min(100, Math.round((userSessions.filter((session) => session.startedAt >= recentStart).length / 12) * 100))}
                exercises={progressRows}
              />
            </RouteFrame>
          }
        />
        <Route
          path="/profile"
          element={
            <RouteFrame>
              <ProfileScreen
                user={selectedUser}
                plan={plan}
                theme={preferences.theme}
                soundEnabled={preferences.soundEnabled}
                wakeLockEnabled={preferences.wakeLockEnabled}
                onThemeChange={(theme: ThemePreference) => void updatePreference({ theme })}
                onSoundChange={(enabled) => {
                  void (async () => {
                    if (enabled && !(await unlockFeedbackAudio())) {
                      setToast('O navegador não liberou áudio; o feedback visual continuará ativo.');
                    }
                    await updatePreference({ soundEnabled: enabled });
                  })();
                }}
                onWakeLockChange={(enabled) => void updatePreference({ wakeLockEnabled: enabled })}
                onExport={() => void downloadBackup().then(() => setToast('Backup exportado.')).catch(() => setToast('Não foi possível exportar o backup.'))}
                onImport={(file) => {
                  if (!window.confirm('Importar este backup substituirá os dados deste aparelho. Continuar?')) return;
                  void importBackupFile(file)
                    .then(async () => {
                      await refreshState();
                      setToast('Backup restaurado com sucesso.');
                      void navigate('/today');
                    })
                    .catch((error: unknown) => setToast(error instanceof Error ? error.message : 'Backup inválido.'));
                }}
                onClearHistory={() => {
                  if (!window.confirm(`Apagar todo o histórico de ${selectedUser.name}? Esta ação não pode ser desfeita.`)) return;
                  void Promise.all([clearWorkoutHistory(selectedUser.id), clearExerciseProgress(selectedUser.id)])
                    .then(async () => {
                      await refreshState();
                      setToast('Histórico apagado.');
                    })
                    .catch(() => setToast('Não foi possível apagar o histórico.'));
                }}
                onChangeUser={() => void updatePreference({ lastUserId: null })}
              />
            </RouteFrame>
          }
        />
        <Route path="/active" element={activeScreen ?? <Navigate to="/today" replace />} />
        <Route path="*" element={<Navigate to="/today" replace />} />
        </Routes>

      <Modal
        open={recoveryOpen && activeWorkout !== null}
        onClose={() => setRecoveryOpen(false)}
        title="Treino em andamento"
        description={
          persistenceState === 'error'
            ? 'Há alterações aguardando uma nova tentativa de salvamento.'
            : 'Cada alteração é salva neste aparelho durante o treino.'
        }
      >
        {activeWorkout ? (
          <div className={styles.recovery}>
            <div className={styles.recoveryMetric}>
              <div>
                <span>{activeWorkout.mode === 'duo' ? 'Lucas + Geovanna' : profiles.find((profile) => profile.id === activeWorkout.activeUserId)?.name}</span>
                <b>Treino {activeWorkout.sessions[activeWorkout.activeUserId]?.workoutCode}</b>
              </div>
              <strong>{formatClock(getElapsedSeconds(activeWorkout.startedAt, now))}</strong>
            </div>
            <div className={styles.recoveryActions}>
              <Button fullWidth onClick={() => { if (preferences.soundEnabled) void unlockFeedbackAudio(); setRecoveryOpen(false); void navigate('/active'); }}>Continuar treino</Button>
              <Button fullWidth variant="danger" onClick={() => { if (window.confirm('Descartar este treino em andamento?')) void discardCurrent(); }}>Descartar</Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <WorkoutDetail
        open={selectedWorkoutDetail !== null}
        workout={selectedWorkoutDetail}
        onClose={() => setSelectedWorkoutDetail(null)}
        onStart={(workout) => void handleStart(workout)}
      />

      <SessionDetail
        open={selectedSessionDetail !== null}
        session={selectedSessionDetail}
        workoutTitle={selectedSessionDetail ? getWorkoutTemplateById(selectedSessionDetail.workoutTemplateId)?.title : undefined}
        userName={selectedUser.name}
        onClose={() => setSelectedSessionDetail(null)}
      />

        <WorkoutCompletion
        open={completionOpen}
        session={completionUserId ? activeWorkout?.sessions[completionUserId] ?? null : null}
        feedback={completionFeedback}
        onFeedbackChange={setCompletionFeedback}
        onConfirm={(feedback) => void confirmCompletion(feedback)}
        onClose={() => setCompletionOpen(false)}
        workoutTitle={completionUserId ? `${getWorkoutTemplateById(activeWorkout?.sessions[completionUserId]?.workoutTemplateId ?? '')?.title ?? 'Treino'} · ${profiles.find((profile) => profile.id === completionUserId)?.name ?? ''}` : undefined}
        progressionCount={0}
        personalRecordCount={0}
        isSaving={savingCompletion}
        />
      </Suspense>

      <PwaStatusCenter
        installHelpDismissed={preferences.installHelpDismissed}
        workoutActive={activeWorkout !== null}
        onDismissInstallHelp={() => void updatePreference({ installHelpDismissed: true })}
      />
      {persistenceState === 'error' && activeWorkout ? (
        <div className={styles.saveError} role="alert">
          <span>Alterações ainda não salvas neste aparelho.</span>
          <button
            type="button"
            onClick={() => {
              const current = activeWorkoutRef.current;
              if (current) void persistActive(current);
            }}
          >
            Tentar novamente
          </button>
        </div>
      ) : null}
      {toast ? <div className={styles.toast} role="status" aria-live="polite">{toast}</div> : null}
    </>
  );
}

export function App() {
  return (
    <HashRouter>
      <AppController />
    </HashRouter>
  );
}
