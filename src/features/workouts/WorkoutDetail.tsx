import {
  Bike,
  Clock3,
  Dumbbell,
  Footprints,
  Gauge,
  Play,
  RotateCcw,
  Target,
} from 'lucide-react';
import { getExercise } from '@/data';
import type { CardioPrescription, ExercisePrescription, RepRange, WorkoutTemplate } from '@/types';
import { Button } from '@/components/ui/Button';
import { DialogSurface } from '@/components/ui/Modal';
import { Surface } from '@/components/ui/Surface';
import styles from './WorkoutDetail.module.css';

export interface WorkoutDetailProps {
  open: boolean;
  workout: WorkoutTemplate | null;
  onClose: () => void;
  onStart: (workout: WorkoutTemplate) => void;
  startLabel?: string;
  isStarting?: boolean;
}

function formatRange(range: RepRange, suffix = ''): string {
  const value = range.min === range.max ? `${range.min}` : `${range.min}–${range.max}`;
  return `${value}${suffix}`;
}

function getCardioName(prescription: CardioPrescription): string {
  return prescription.modality === 'treadmill' ? 'Caminhada na esteira' : 'Bicicleta ergométrica';
}

function getPrescriptionSummary(prescription: ExercisePrescription): string {
  switch (prescription.kind) {
    case 'strength':
      return `${prescription.sets} × ${formatRange(prescription.repetitions)} · RIR ${formatRange(prescription.targetRir)} · ${prescription.restSeconds}s`;
    case 'carry':
      return `${prescription.sets} × ${formatRange(prescription.durationSeconds, 's')} · RPE ${formatRange(prescription.targetRpe)} · ${prescription.restSeconds}s`;
    case 'cardio':
      return `${formatRange(prescription.durationMinutes, ' min')} · RPE ${formatRange(prescription.targetRpe)}`;
  }
}

function PrescriptionIcon({ prescription }: { prescription: ExercisePrescription }) {
  if (prescription.kind === 'cardio') {
    return prescription.modality === 'treadmill' ? (
      <Footprints aria-hidden="true" />
    ) : (
      <Bike aria-hidden="true" />
    );
  }

  return <Dumbbell aria-hidden="true" />;
}

export function WorkoutDetail({
  open,
  workout,
  onClose,
  onStart,
  startLabel = 'Iniciar treino',
  isStarting = false,
}: WorkoutDetailProps) {
  if (!workout) {
    return null;
  }

  const strengthExerciseCount = workout.exercises.filter(
    (prescription) => prescription.kind !== 'cardio',
  ).length;
  const orderedPrescriptions = [...workout.exercises].sort((a, b) => a.order - b.order);

  return (
    <DialogSurface
      open={open}
      onClose={onClose}
      title={`Treino ${workout.code}`}
      description={workout.title}
      variant="adaptive"
      footer={
        <Button
          fullWidth
          size="large"
          leadingIcon={<Play aria-hidden="true" />}
          isLoading={isStarting}
          loadingLabel="Preparando treino"
          onClick={() => onStart(workout)}
        >
          {startLabel}
        </Button>
      }
    >
      <div className={styles.content}>
        <div className={styles.overview} aria-label="Resumo do treino">
          <span>
            <Clock3 aria-hidden="true" />
            {formatRange(workout.estimatedMinutes, ' min')}
          </span>
          <span>
            <Dumbbell aria-hidden="true" />
            {strengthExerciseCount} exercícios
          </span>
        </div>

        <div className={styles.focusList} aria-label="Foco do treino">
          {workout.focus.map((focus) => (
            <span key={focus}>{focus}</span>
          ))}
        </div>

        <section className={styles.section} aria-labelledby="workout-warmup-title">
          <div className={styles.sectionHeading}>
            <div className={styles.headingIcon}>
              <RotateCcw aria-hidden="true" />
            </div>
            <div>
              <p className={styles.eyebrow}>Preparação</p>
              <h3 id="workout-warmup-title">Aquecimento</h3>
            </div>
          </div>

          <Surface className={styles.warmupCard} tone="muted" padding="compact">
            <div className={styles.warmupBlock}>
              <strong>Geral</strong>
              <span>
                {workout.warmup.general.modality === 'treadmill' ? 'Esteira' : 'Bicicleta'} ·{' '}
                {formatRange(workout.warmup.general.durationMinutes, ' min')} · RPE{' '}
                {formatRange(workout.warmup.general.targetRpe)}
              </span>
              <ul>
                {workout.warmup.general.instructions.map((instruction) => (
                  <li key={instruction}>{instruction}</li>
                ))}
              </ul>
            </div>
            <div className={styles.divider} />
            <div className={styles.warmupBlock}>
              <strong>Específico</strong>
              <span>{formatRange(workout.warmup.specific.repetitions)} repetições leves</span>
              <ul>
                {workout.warmup.specific.instructions.map((instruction) => (
                  <li key={instruction}>{instruction}</li>
                ))}
              </ul>
            </div>
          </Surface>
        </section>

        <section className={styles.section} aria-labelledby="workout-exercises-title">
          <div className={styles.sectionHeading}>
            <div className={styles.headingIcon}>
              <Target aria-hidden="true" />
            </div>
            <div>
              <p className={styles.eyebrow}>Sequência</p>
              <h3 id="workout-exercises-title">Exercícios e cardio</h3>
            </div>
          </div>

          <ol className={styles.prescriptionList}>
            {orderedPrescriptions.map((prescription) => {
              const exercise =
                prescription.kind === 'cardio' ? undefined : getExercise(prescription.exerciseId);
              const name =
                prescription.kind === 'cardio'
                  ? getCardioName(prescription)
                  : (exercise?.name ?? 'Exercício');
              const equipment =
                prescription.kind === 'cardio'
                  ? prescription.equipmentLabel
                  : (exercise?.equipmentLabel ?? 'Equipamento informado na ficha');

              return (
                <li key={prescription.id} className={styles.prescriptionItem}>
                  <div className={styles.order}>{prescription.order}</div>
                  <div className={styles.exerciseIcon}>
                    <PrescriptionIcon prescription={prescription} />
                  </div>
                  <div className={styles.prescriptionCopy}>
                    <strong>{name}</strong>
                    <span>{equipment}</span>
                    <small>{getPrescriptionSummary(prescription)}</small>
                    {prescription.userNotes?.length ? (
                      <ul className={styles.notes}>
                        {prescription.userNotes.map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    ) : null}
                    {prescription.kind === 'cardio' ? (
                      <p className={styles.talkTest}>
                        <Gauge aria-hidden="true" />
                        {prescription.talkTest}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </DialogSurface>
  );
}
