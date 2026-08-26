import {
  Bike,
  CalendarDays,
  Check,
  Clock3,
  Dumbbell,
  Footprints,
  Gauge,
  HeartPulse,
  MessageSquareText,
} from 'lucide-react';
import { getExercise } from '@/data';
import type { SetSession, WorkoutSession } from '@/types';
import { calculateSessionStats } from '@/utils/volume';
import { DialogSurface } from '@/components/ui/Modal';
import { Surface } from '@/components/ui/Surface';
import styles from './SessionDetail.module.css';

export interface SessionDetailProps {
  open: boolean;
  session: WorkoutSession | null;
  onClose: () => void;
  workoutTitle?: string;
  userName?: string;
}

const FEELING_LABELS = {
  'very-heavy': 'Muito pesado',
  heavy: 'Pesado',
  good: 'Bom',
  easy: 'Fácil',
} as const;

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp);
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) {
    return '—';
  }

  const totalMinutes = Math.max(0, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return hours > 0 ? `${hours}h ${minutes.toString().padStart(2, '0')}min` : `${minutes} min`;
}

function formatDecimal(value: number): string {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value);
}

function getSetResult(set: SetSession): string {
  if (set.durationSeconds !== null) {
    const load = set.loadKg !== null ? `${formatDecimal(set.loadKg)} kg · ` : '';
    return `${load}${set.durationSeconds}s`;
  }

  if (set.loadKg === null && set.repetitions === null) {
    return 'Sem registro';
  }

  const load = set.loadKg !== null ? `${formatDecimal(set.loadKg)} kg` : 'Peso corporal';
  const repetitions = set.repetitions !== null ? `${set.repetitions} reps` : '— reps';
  return `${load} × ${repetitions}`;
}

function getStatusLabel(status: WorkoutSession['status']): string {
  switch (status) {
    case 'completed':
      return 'Concluído';
    case 'active':
      return 'Em andamento';
    case 'discarded':
      return 'Descartado';
  }
}

export function SessionDetail({
  open,
  session,
  onClose,
  workoutTitle,
  userName,
}: SessionDetailProps) {
  if (!session) {
    return null;
  }

  const stats = calculateSessionStats(session);
  const completedExercises = session.exercises.filter((exercise) =>
    exercise.sets.some((set) => set.completed),
  );

  return (
    <DialogSurface
      open={open}
      onClose={onClose}
      title={`Treino ${session.workoutCode}`}
      description={workoutTitle ?? `${getStatusLabel(session.status)}${userName ? ` · ${userName}` : ''}`}
      variant="adaptive"
    >
      <div className={styles.content}>
        <div className={styles.sessionMeta}>
          <span>
            <CalendarDays aria-hidden="true" />
            {formatDate(session.startedAt)}
          </span>
          <span className={styles.status} data-status={session.status}>
            <Check aria-hidden="true" />
            {getStatusLabel(session.status)}
          </span>
        </div>

        <section className={styles.summaryGrid} aria-label="Resumo da sessão">
          <Surface className={styles.metric} tone="muted" padding="compact">
            <Clock3 aria-hidden="true" />
            <strong>{formatDuration(session.durationSeconds)}</strong>
            <span>Duração</span>
          </Surface>
          <Surface className={styles.metric} tone="muted" padding="compact">
            <Dumbbell aria-hidden="true" />
            <strong>{stats.completedSets}</strong>
            <span>Séries</span>
          </Surface>
          <Surface className={styles.metric} tone="accent" padding="compact">
            <Gauge aria-hidden="true" />
            <strong>{Math.round(stats.volumeKg).toLocaleString('pt-BR')}</strong>
            <span>kg de volume</span>
          </Surface>
        </section>

        <section className={styles.section} aria-labelledby="session-exercises-title">
          <div className={styles.sectionHeading}>
            <div>
              <p>Musculação</p>
              <h3 id="session-exercises-title">Exercícios realizados</h3>
            </div>
            <span>{stats.completedExercises}</span>
          </div>

          {completedExercises.length > 0 ? (
            <div className={styles.exerciseList}>
              {completedExercises.map((exerciseSession) => {
                const exercise = getExercise(exerciseSession.exerciseId);
                const completedSets = exerciseSession.sets.filter((set) => set.completed);

                return (
                  <Surface
                    as="article"
                    className={styles.exerciseCard}
                    key={exerciseSession.id}
                    padding="compact"
                    tone="muted"
                  >
                    <header className={styles.exerciseHeader}>
                      <div className={styles.exerciseIcon}>
                        <Dumbbell aria-hidden="true" />
                      </div>
                      <div>
                        <h4>{exercise?.name ?? 'Exercício'}</h4>
                        <p>{exercise?.equipmentLabel ?? 'Equipamento da ficha'}</p>
                      </div>
                    </header>

                    <div className={styles.setList} aria-label={`Séries de ${exercise?.name ?? 'exercício'}`}>
                      {completedSets.map((set) => (
                        <div className={styles.setRow} key={set.id}>
                          <span>Série {set.setNumber}</span>
                          <strong>{getSetResult(set)}</strong>
                          <small>
                            {set.durationSeconds !== null
                              ? set.rir !== null ? `RPE ${set.rir}` : 'RPE —'
                              : set.rir !== null ? `RIR ${set.rir}` : 'RIR —'}
                          </small>
                        </div>
                      ))}
                    </div>
                  </Surface>
                );
              })}
            </div>
          ) : (
            <p className={styles.empty}>Nenhuma série foi marcada como concluída.</p>
          )}
        </section>

        {session.cardio ? (
          <section className={styles.section} aria-labelledby="session-cardio-title">
            <div className={styles.sectionHeading}>
              <div>
                <p>Finalização</p>
                <h3 id="session-cardio-title">Cardio</h3>
              </div>
            </div>
            <Surface className={styles.cardioCard} tone="timer" padding="default">
              <div className={styles.cardioHeader}>
                <div className={styles.cardioIcon}>
                  {session.cardio.modality === 'treadmill' ? (
                    <Footprints aria-hidden="true" />
                  ) : (
                    <Bike aria-hidden="true" />
                  )}
                </div>
                <div>
                  <strong>
                    {session.cardio.modality === 'treadmill' ? 'Esteira' : 'Bicicleta'}
                  </strong>
                  <span>
                    {formatDuration(session.cardio.durationSeconds)} de atividade
                  </span>
                </div>
              </div>
              <dl className={styles.cardioMetrics}>
                {session.cardio.distanceKm !== null ? (
                  <div>
                    <dt>Distância</dt>
                    <dd>{formatDecimal(session.cardio.distanceKm)} km</dd>
                  </div>
                ) : null}
                {session.cardio.speedKmh !== null ? (
                  <div>
                    <dt>Velocidade</dt>
                    <dd>{formatDecimal(session.cardio.speedKmh)} km/h</dd>
                  </div>
                ) : null}
                {session.cardio.inclinePercent !== null ? (
                  <div>
                    <dt>Inclinação</dt>
                    <dd>{formatDecimal(session.cardio.inclinePercent)}%</dd>
                  </div>
                ) : null}
                {session.cardio.intensityLevel !== null ? (
                  <div>
                    <dt>Intensidade</dt>
                    <dd>Nível {formatDecimal(session.cardio.intensityLevel)}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>RPE</dt>
                  <dd>{session.cardio.rpe ?? '—'}</dd>
                </div>
              </dl>
            </Surface>
          </section>
        ) : null}

        {session.feedback ? (
          <section className={styles.section} aria-labelledby="session-feedback-title">
            <div className={styles.sectionHeading}>
              <div>
                <p>Percepção</p>
                <h3 id="session-feedback-title">Feedback pós-treino</h3>
              </div>
            </div>
            <Surface className={styles.feedbackCard} tone="muted" padding="default">
              <div>
                <HeartPulse aria-hidden="true" />
                <span>Como foi</span>
                <strong>
                  {session.feedback.feeling
                    ? FEELING_LABELS[session.feedback.feeling]
                    : 'Não informado'}
                </strong>
              </div>
              <div>
                <Gauge aria-hidden="true" />
                <span>RPE geral</span>
                <strong>{session.feedback.overallRpe ?? '—'}</strong>
              </div>
              {session.feedback.notes ? (
                <p>
                  <MessageSquareText aria-hidden="true" />
                  {session.feedback.notes}
                </p>
              ) : null}
            </Surface>
          </section>
        ) : null}
      </div>
    </DialogSurface>
  );
}
