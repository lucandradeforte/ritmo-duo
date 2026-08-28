import { RotateCcw } from 'lucide-react';
import {
  useCallback,
  useEffect,
  lazy,
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
} from '@/data';
import { WorkoutElapsedTime } from '@/features/active-workout/WorkoutElapsedTime';
import { EMPTY_WORKOUT_FEEDBACK } from '@/features/active-workout/workout-feedback';
import { ProfileSelectScreen } from '@/features/users/ProfileSelectScreen';
import { TodayScreen } from '@/features/workouts/TodayScreen';
import {
  PwaStatusCenter,
  unlockFeedbackAudio,
  useOnlineStatus,
  useWakeLock,
} from '@/pwa';
import {
  clearUserWorkoutHistory,
  completeActiveWorkout,
  addWeightEntry,
  discardActiveWorkout,
  downloadBackup,
  importBackupFile,
  updatePreferences,
} from '@/storage';
import type {
  ActiveWorkoutState,
  AppPreferences,
  ThemePreference,
  UserId,
  WorkoutSession,
  WorkoutTemplate,
  WorkoutFeedback,
} from '@/types';
import {
  calculateProgramWeekFromHistory,
  calculateSessionVolume,
  createActiveWorkout,
  getPendingParticipantIds,
  switchActiveWorkoutUser,
} from '@/utils';
import { ActiveWorkoutRoute } from './ActiveWorkoutRoute';
import { AppErrorBoundary } from './AppErrorBoundary';
import { useActiveWorkoutController } from './useActiveWorkoutController';
import { useAppBootstrap } from './useAppBootstrap';
import { useSelectedUserData } from './useSelectedUserData';
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
  const location = useLocation();
  const {
    loading,
    fatalError,
    preferences,
    profiles,
    sessions,
    progress,
    weightEntries,
    activeWorkout,
    recoveryOpen,
    setRecoveryOpen,
    setPreferences,
    addWeightEntry: appendWeightEntry,
    setActiveWorkout,
    refreshState,
  } = useAppBootstrap();
  const {
    persistenceState,
    persistActiveWorkout: persistActive,
    clearActiveWorkout,
    getActiveWorkout: getCurrentWorkout,
    waitForPendingWrites,
    retryPersistence,
  } = useActiveWorkoutController({
    activeWorkout,
    onActiveWorkoutChange: setActiveWorkout,
  });
  const [calendarNow, setCalendarNow] = useState(() => Date.now());
  const [toast, setToast] = useState<string | null>(null);
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<WorkoutSession | null>(null);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [completionUserId, setCompletionUserId] = useState<UserId | null>(null);
  const [completionFeedback, setCompletionFeedback] = useState<WorkoutFeedback>({
    ...EMPTY_WORKOUT_FEEDBACK,
  });
  const [savingCompletion, setSavingCompletion] = useState(false);
  const online = useOnlineStatus();

  useEffect(() => {
    const sync = () => setCalendarNow(Date.now());
    const interval = window.setInterval(sync, 60_000);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('focus', sync);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('focus', sync);
    };
  }, []);

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
  const {
    selectedUser,
    currentUser,
    userSessions,
    userProgress,
    userWeightEntries,
  } = useSelectedUserData({ selectedUserId, profiles, sessions, progress, weightEntries });

  const updatePreference = useCallback(async (patch: Partial<Omit<AppPreferences, 'id' | 'updatedAt'>>) => {
    const next = await updatePreferences(patch);
    setPreferences(next);
    return next;
  }, [setPreferences]);

  const handleAddWeightEntry = useCallback(
    async (weightKg: number, recordedAt: number) => {
      if (!selectedUserId) {
        throw new Error('Selecione um perfil antes de registrar o peso.');
      }
      const entry = await addWeightEntry({ userId: selectedUserId, weightKg, recordedAt });
      appendWeightEntry(entry);
    },
    [appendWeightEntry, selectedUserId],
  );

  const handleSelectProfile = useCallback(
    async (userId: UserId) => {
      await updatePreference({ lastUserId: userId });
      void navigate('/today');
    },
    [navigate, updatePreference],
  );

  const handleStart = useCallback(
    async (template: WorkoutTemplate, duo = false) => {
      if (getCurrentWorkout()) {
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
    [getCurrentWorkout, navigate, persistActive, preferences?.soundEnabled, sessions, setRecoveryOpen],
  );

  const discardCurrent = useCallback(async () => {
    await waitForPendingWrites();
    await discardActiveWorkout();
    clearActiveWorkout();
    setRecoveryOpen(false);
    setToast('Treino em andamento descartado.');
    void navigate('/today');
  }, [clearActiveWorkout, navigate, setRecoveryOpen, waitForPendingWrites]);

  const requestCompletion = useCallback(() => {
    const current = getCurrentWorkout();
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
  }, [getCurrentWorkout]);

  const confirmCompletion = useCallback(
    async (feedback: WorkoutFeedback) => {
      const current = getCurrentWorkout();
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
        clearActiveWorkout();
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
    [clearActiveWorkout, completionUserId, getCurrentWorkout, navigate, persistActive, profiles, refreshState, setRecoveryOpen],
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
          <p>Não foi possível acessar os dados locais necessários para iniciar o aplicativo.</p>
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

  const currentProgramWeek = calculateProgramWeekFromHistory(
    sessions,
    selectedUser.id,
    calendarNow,
  );
  const includeOptionalThirdSet = isReadyForOptionalVolume(sessions);
  const plan = getWorkoutPlan(selectedUser.id);
  const selectedWorkoutDetail =
    plan.templates.find(
      (template) => template.id === new URLSearchParams(location.search).get('ficha'),
    ) ?? null;
  const nextWorkout = suggestedWorkout(plan.templates, userSessions, calendarNow);
  const weekStart = getWeekStart(calendarNow);
  const completedThisWeek = userSessions.filter((session) => session.startedAt >= weekStart).length;
  const currentDate = new Date(calendarNow);
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getTime();
  const recentStart = calendarNow - 28 * 24 * 60 * 60 * 1_000;
  const progressRows = userProgress.map((record) => ({
    exerciseName: getExercise(record.exerciseId)?.name ?? record.exerciseId,
    currentLoadKg: record.lastLoadKg,
    bestLoadKg: record.bestLoadKg,
    trendPercent: 0,
  }));

  const activeScreen = activeWorkout ? (
    <ActiveWorkoutRoute
      state={activeWorkout}
      profiles={profiles}
      sessions={sessions}
      online={online}
      soundEnabled={preferences.soundEnabled}
      getCurrentWorkout={getCurrentWorkout}
      onPersistWorkout={persistActive}
      onBack={() => void navigate('/today')}
      onRequestCompletion={requestCompletion}
      onToast={setToast}
    />
  ) : null;

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
                activeWorkoutStartedAt={activeWorkout?.startedAt}
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
                onView={(workout) => void navigate(`/workouts?ficha=${workout.id}`)}
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
                weightEntries={userWeightEntries}
                onAddWeightEntry={handleAddWeightEntry}
              />
            </RouteFrame>
          }
        />
        <Route
          path="/profile"
          element={
            <RouteFrame>
              <ProfileScreen
                user={currentUser ?? selectedUser}
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
                  void clearUserWorkoutHistory(selectedUser.id)
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
              <strong><WorkoutElapsedTime startedAt={activeWorkout.startedAt} /></strong>
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
        programWeek={currentProgramWeek}
        includeOptionalThirdSet={includeOptionalThirdSet}
        online={online}
        onClose={() => void navigate('/workouts', { replace: true })}
        onStart={(workout) => {
          void navigate('/workouts', { replace: true });
          void handleStart(workout);
        }}
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
            onClick={() => void retryPersistence()}
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
    <AppErrorBoundary>
      <HashRouter>
        <AppController />
      </HashRouter>
    </AppErrorBoundary>
  );
}
