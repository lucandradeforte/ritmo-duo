import { ArrowLeft, ChevronLeft, ChevronRight, CircleHelp, Dumbbell, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import type {
  ActiveWorkoutState,
  CardioSession,
  CardioPrescription,
  Exercise,
  ExercisePrescription,
  ExerciseSession,
  ProgressionSuggestion,
  RestTimerState,
  SetSession,
  UserId,
  UserProfile,
  WorkoutTemplate,
} from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Surface';
import { ProfileSwitcher } from '@/components/ui/ProfileSwitcher';
import { ExerciseDetail } from '@/features/exercises/ExerciseDetail';
import { ExerciseSetRow } from './ExerciseSetRow';
import { RestTimer } from './RestTimer';
import { CardioTracker } from './CardioTracker';
import styles from './ActiveWorkoutScreen.module.css';

interface ActiveWorkoutScreenProps {
  state: ActiveWorkoutState;
  profiles: readonly UserProfile[];
  template: WorkoutTemplate;
  prescription: ExercisePrescription;
  exercise?: Exercise;
  exerciseSession?: ExerciseSession;
  previousSets?: SetSession[];
  restTimer: RestTimerState | null;
  elapsedLabel: string;
  cardioElapsedSeconds: number;
  online: boolean;
  onBack: () => void;
  onSwitchUser: (userId: UserId) => void;
  progressionSuggestion?: ProgressionSuggestion;
  onSetChange: (
    setId: string,
    changes: Pick<SetSession, 'loadKg' | 'repetitions' | 'durationSeconds' | 'rir'>,
  ) => void;
  onSetComplete: (setId: string) => void;
  onPreviousExercise: () => void;
  onNextExercise: () => void;
  onFinish: () => void;
  onRestAdjust: (seconds: number) => void;
  onRestSkip: () => void;
  onRestFinished: () => void;
  onCardioStart: () => void;
  onCardioUpdate: (changes: Partial<CardioSession>) => void;
  onCardioComplete: () => void;
}

function prescriptionLabel(
  prescription: ExercisePrescription,
  activeSetCount?: number,
  cardioTargetSeconds?: number,
): string {
  if (prescription.kind === 'strength') {
    return `${activeSetCount ?? prescription.sets} × ${prescription.repetitions.min}–${prescription.repetitions.max} · RIR ${prescription.targetRir.min}–${prescription.targetRir.max}`;
  }
  if (prescription.kind === 'carry') {
    return `${activeSetCount ?? prescription.sets} × ${prescription.durationSeconds.min}–${prescription.durationSeconds.max} s · RPE ${prescription.targetRpe.min}–${prescription.targetRpe.max}`;
  }
  const targetMinutes = cardioTargetSeconds
    ? Math.round(cardioTargetSeconds / 60)
    : prescription.durationMinutes.min;
  return `${targetMinutes} min nesta fase · RPE ${prescription.targetRpe.min}–${prescription.targetRpe.max}`;
}

export function ActiveWorkoutScreen({
  state,
  profiles,
  template,
  prescription,
  exercise,
  exerciseSession,
  previousSets = [],
  restTimer,
  elapsedLabel,
  cardioElapsedSeconds,
  online,
  progressionSuggestion,
  onBack,
  onSwitchUser,
  onSetChange,
  onSetComplete,
  onPreviousExercise,
  onNextExercise,
  onFinish,
  onRestAdjust,
  onRestSkip,
  onRestFinished,
  onCardioStart,
  onCardioUpdate,
  onCardioComplete,
}: ActiveWorkoutScreenProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const activeSession = state.sessions[state.activeUserId];
  const currentIndex = activeSession?.currentExerciseIndex ?? 0;
  const total = template.exercises.length;
  const isLast = currentIndex >= total - 1;

  const profileOptions = useMemo(
    () => profiles.filter((profile) => state.participantIds.includes(profile.id)).map((profile) => ({
      id: profile.id,
      name: profile.name,
      description: profile.id === state.activeUserId ? 'Em execução' : 'Aguardando',
      tone: profile.id === 'lucas' ? ('lime' as const) : ('orange' as const),
    })),
    [profiles, state.activeUserId, state.participantIds],
  );

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <button aria-label="Voltar" type="button" onClick={onBack}><ArrowLeft /></button>
        <div><span>Treino {template.code}</span><strong className="numeric">{elapsedLabel}</strong></div>
        <div className={online ? styles.step : styles.offlineHeader}>
          {online ? `${currentIndex + 1}/${total}` : 'Offline'}
        </div>
      </header>

      <main className={styles.content}>
        {state.mode === 'duo' ? (
          <Card className={styles.duo} padding="compact" tone="muted">
            <div className={styles.duoHeading}><UsersRound aria-hidden="true" /><span>Uma pessoa por vez na estação</span></div>
            <ProfileSwitcher profiles={profileOptions} activeProfileId={state.activeUserId} onSelect={(id) => onSwitchUser(id as UserId)} variant="segmented" label="Alternar pessoa" />
          </Card>
        ) : null}

        <section className={styles.exerciseHeading}>
          <div className={styles.exerciseIcon} aria-hidden="true"><Dumbbell /></div>
          <div>
            <span>{exercise?.equipmentLabel ?? (prescription as CardioPrescription).equipmentLabel}</span>
            <h1>{exercise?.name ?? ((prescription as CardioPrescription).modality === 'bike' ? 'Bicicleta' : 'Esteira')}</h1>
          </div>
          {exercise ? (
            <Button size="icon" variant="ghost" aria-label="Ver execução" onClick={() => setDetailOpen(true)}><CircleHelp /></Button>
          ) : null}
        </section>

        {currentIndex === 0 ? (
          <details className={styles.warmup}>
            <summary>Aquecimento · {template.warmup.general.durationMinutes.min}–{template.warmup.general.durationMinutes.max} min</summary>
            <div>
              <strong>Geral</strong>
              <p>{template.warmup.general.instructions.join(' ')}</p>
              <strong>Específico</strong>
              <p>{template.warmup.specific.instructions.join(' ')}</p>
            </div>
          </details>
        ) : null}

        <Card className={styles.prescription} padding="compact" tone="muted">
          <strong>
            {prescriptionLabel(
              prescription,
              exerciseSession?.sets.length,
              activeSession?.cardio?.targetDurationSeconds,
            )}
          </strong>
          {prescription.kind !== 'cardio' ? <span>Descanso {prescription.restSeconds} s</span> : null}
        </Card>

        {prescription.kind === 'cardio' && activeSession?.cardio ? (
          <CardioTracker
            prescription={prescription}
            session={activeSession.cardio}
            elapsedSeconds={cardioElapsedSeconds}
            onStart={onCardioStart}
            onUpdate={onCardioUpdate}
            onComplete={onCardioComplete}
          />
        ) : (
          <section className={styles.sets} aria-label="Séries de trabalho">
            <div className={styles.setsLabel}><span>Séries de trabalho</span><small>Toque nos valores para editar</small></div>
            {exerciseSession?.sets.map((set) => (
              <ExerciseSetRow
                key={set.id}
                set={set}
                mode={prescription.kind === 'carry' ? 'duration' : 'repetitions'}
                loadOptional={exercise?.equipmentTypes.includes('bodyweight') ?? false}
                previous={previousSets.find(
                  (previousSet) => previousSet.setNumber === set.setNumber,
                )}
                onChange={(changes) => onSetChange(set.id, changes)}
                onComplete={() => onSetComplete(set.id)}
              />
            ))}
          </section>
        )}

        {progressionSuggestion?.eligible ? (
          <Card className={styles.progression} padding="compact" tone="accent">
            <span>Progressão sugerida</span>
            <strong>{progressionSuggestion.message}</strong>
            <small>A sugestão não altera sua carga automaticamente.</small>
          </Card>
        ) : null}

        {restTimer ? <RestTimer timer={restTimer} onAdjust={onRestAdjust} onSkip={onRestSkip} onFinished={onRestFinished} /> : null}

        <nav className={styles.exerciseNavigation} aria-label="Navegação entre exercícios">
          <Button variant="ghost" leadingIcon={<ChevronLeft />} disabled={currentIndex === 0} onClick={onPreviousExercise}>Anterior</Button>
          {isLast ? (
            <Button
              trailingIcon={<ChevronRight />}
              disabled={prescription.kind === 'cardio' && activeSession?.cardio?.completedAt === null}
              onClick={onFinish}
            >
              Finalizar treino
            </Button>
          ) : (
            <Button trailingIcon={<ChevronRight />} onClick={onNextExercise}>Próximo</Button>
          )}
        </nav>
      </main>

      <ExerciseDetail exercise={exercise ?? null} open={detailOpen} online={online} onClose={() => setDetailOpen(false)} />
    </div>
  );
}
