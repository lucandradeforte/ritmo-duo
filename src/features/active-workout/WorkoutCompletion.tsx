import {
  Check,
  Clock3,
  Dumbbell,
  Gauge,
  Sparkles,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import type { WorkoutFeedback, WorkoutSession } from '@/types';
import { calculateSessionStats } from '@/utils/volume';
import { Button } from '@/components/ui/Button';
import { DialogSurface } from '@/components/ui/Modal';
import { Surface } from '@/components/ui/Surface';
import styles from './WorkoutCompletion.module.css';

export interface WorkoutCompletionProps {
  open: boolean;
  session: WorkoutSession | null;
  feedback: WorkoutFeedback;
  onFeedbackChange: (feedback: WorkoutFeedback) => void;
  onConfirm: (feedback: WorkoutFeedback) => void;
  onClose: () => void;
  workoutTitle?: string;
  progressionCount?: number;
  personalRecordCount?: number;
  isSaving?: boolean;
}

const FEELING_OPTIONS: ReadonlyArray<{
  value: NonNullable<WorkoutFeedback['feeling']>;
  label: string;
  caption: string;
}> = [
  { value: 'very-heavy', label: 'Muito pesado', caption: 'Precisa ajustar' },
  { value: 'heavy', label: 'Pesado', caption: 'Exigiu bastante' },
  { value: 'good', label: 'Bom', caption: 'Esforço adequado' },
  { value: 'easy', label: 'Fácil', caption: 'Sobrou energia' },
];

const RPE_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

function formatDuration(seconds: number): string {
  const totalMinutes = Math.max(0, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes.toString().padStart(2, '0')}min` : `${minutes} min`;
}

function getSessionDuration(session: WorkoutSession): number {
  if (session.durationSeconds !== null) {
    return session.durationSeconds;
  }

  const endedAt = session.completedAt ?? Date.now();
  return Math.max(0, Math.floor((endedAt - session.startedAt) / 1000));
}

export function WorkoutCompletion({
  open,
  session,
  feedback,
  onFeedbackChange,
  onConfirm,
  onClose,
  workoutTitle,
  progressionCount = 0,
  personalRecordCount = 0,
  isSaving = false,
}: WorkoutCompletionProps) {
  if (!session) {
    return null;
  }

  const stats = calculateSessionStats(session);
  const sessionDuration = getSessionDuration(session);

  const updateFeedback = (patch: Partial<WorkoutFeedback>) => {
    onFeedbackChange({ ...feedback, ...patch });
  };

  return (
    <DialogSurface
      open={open}
      onClose={onClose}
      closeOnBackdrop={false}
      title="Treino concluído"
      description={workoutTitle ?? `Treino ${session.workoutCode}`}
      variant="adaptive"
      footer={
        <Button
          fullWidth
          size="large"
          leadingIcon={<Check aria-hidden="true" />}
          isLoading={isSaving}
          loadingLabel="Salvando treino"
          onClick={() => onConfirm(feedback)}
        >
          Salvar e concluir
        </Button>
      }
    >
      <div className={styles.content}>
        <div className={styles.celebration} aria-hidden="true">
          <span>
            <Sparkles />
          </span>
        </div>

        <section className={styles.summaryGrid} aria-label="Resumo do treino concluído">
          <Surface className={styles.metric} tone="muted" padding="compact">
            <Clock3 aria-hidden="true" />
            <strong>{formatDuration(sessionDuration)}</strong>
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

        {progressionCount > 0 || personalRecordCount > 0 ? (
          <div className={styles.highlights} aria-label="Destaques do treino">
            {progressionCount > 0 ? (
              <Surface className={styles.highlight} tone="accent" padding="compact">
                <TrendingUp aria-hidden="true" />
                <div>
                  <strong>{progressionCount}</strong>
                  <span>{progressionCount === 1 ? 'progressão sugerida' : 'progressões sugeridas'}</span>
                </div>
              </Surface>
            ) : null}
            {personalRecordCount > 0 ? (
              <Surface className={styles.highlight} tone="timer" padding="compact">
                <Trophy aria-hidden="true" />
                <div>
                  <strong>{personalRecordCount}</strong>
                  <span>{personalRecordCount === 1 ? 'novo recorde' : 'novos recordes'}</span>
                </div>
              </Surface>
            ) : null}
          </div>
        ) : null}

        <section className={styles.feedbackSection} aria-labelledby="completion-feeling-title">
          <div className={styles.sectionHeading}>
            <p>Opcional</p>
            <h3 id="completion-feeling-title">Como foi o treino?</h3>
            <span>Esse registro ajuda a ajustar os próximos treinos.</span>
          </div>
          <div className={styles.feelingGrid} role="group" aria-label="Sensação no treino">
            {FEELING_OPTIONS.map((option) => {
              const selected = feedback.feeling === option.value;
              return (
                <button
                  className={styles.feelingButton}
                  data-selected={selected || undefined}
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    updateFeedback({ feeling: selected ? null : option.value })
                  }
                >
                  <strong>{option.label}</strong>
                  <span>{option.caption}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className={styles.feedbackSection} aria-labelledby="completion-rpe-title">
          <div className={styles.sectionHeading}>
            <p>Opcional</p>
            <div className={styles.inlineHeading}>
              <h3 id="completion-rpe-title">RPE geral</h3>
              {feedback.overallRpe !== null ? (
                <button
                  className={styles.clearButton}
                  type="button"
                  onClick={() => updateFeedback({ overallRpe: null })}
                >
                  Limpar
                </button>
              ) : null}
            </div>
            <span>1 é muito leve; 10 é o máximo esforço percebido.</span>
          </div>
          <div className={styles.rpeGrid} role="group" aria-label="RPE geral de 1 a 10">
            {RPE_VALUES.map((rpe) => {
              const selected = feedback.overallRpe === rpe;
              return (
                <button
                  className={styles.rpeButton}
                  data-selected={selected || undefined}
                  key={rpe}
                  type="button"
                  aria-label={`RPE ${rpe}`}
                  aria-pressed={selected}
                  onClick={() => updateFeedback({ overallRpe: selected ? null : rpe })}
                >
                  {rpe}
                </button>
              );
            })}
          </div>
        </section>

        <label className={styles.notesField}>
          <span>Observações <small>(opcional)</small></span>
          <textarea
            rows={3}
            maxLength={280}
            value={feedback.notes}
            placeholder="Ex.: joelho confortável, carga leve demais…"
            onChange={(event) => updateFeedback({ notes: event.currentTarget.value })}
          />
          <small>{feedback.notes.length}/280</small>
        </label>
      </div>
    </DialogSurface>
  );
}
