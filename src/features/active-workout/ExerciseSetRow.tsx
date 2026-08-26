import { Check } from 'lucide-react';
import type { SetSession } from '@/types';
import styles from './ExerciseSetRow.module.css';

interface ExerciseSetRowProps {
  set: SetSession;
  mode?: 'repetitions' | 'duration';
  loadOptional?: boolean;
  previous?: Pick<SetSession, 'loadKg' | 'repetitions' | 'durationSeconds'>;
  onChange: (
    changes: Pick<SetSession, 'loadKg' | 'repetitions' | 'durationSeconds' | 'rir'>,
  ) => void;
  onComplete: () => void;
}

function parseDecimal(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parseInteger(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parseEffort(value: string, minimum: number): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= 10 ? parsed : null;
}

export function ExerciseSetRow({
  set,
  mode = 'repetitions',
  loadOptional = false,
  previous,
  onChange,
  onComplete,
}: ExerciseSetRowProps) {
  const isDuration = mode === 'duration';
  const minimumEffort = isDuration ? 1 : 0;
  const completedMeasure = isDuration ? set.durationSeconds : set.repetitions;
  const previousMeasure = isDuration ? previous?.durationSeconds : previous?.repetitions;
  const canComplete =
    (loadOptional || (set.loadKg !== null && set.loadKg > 0)) &&
    completedMeasure !== null &&
    completedMeasure !== undefined &&
    completedMeasure > 0 &&
    set.rir !== null &&
    Number.isInteger(set.rir) &&
    set.rir >= minimumEffort &&
    set.rir <= 10;

  const createPatch = (
    patch: Partial<Pick<SetSession, 'loadKg' | 'repetitions' | 'durationSeconds' | 'rir'>>,
  ) => ({
    loadKg: set.loadKg,
    repetitions: set.repetitions,
    durationSeconds: set.durationSeconds,
    rir: set.rir,
    ...patch,
  });

  return (
    <div className={`${styles.row} ${set.completed ? styles.completed : ''}`}>
      <div className={styles.setNumber} aria-label={`Série ${set.setNumber}`}>
        {set.setNumber}
      </div>
      <div className={styles.previous}>
        <span>Anterior</span>
        <strong>
          {previous?.loadKg ?? '—'} kg × {previousMeasure ?? '—'}{isDuration ? ' s' : ''}
        </strong>
      </div>
      <label className={styles.field}>
        <span>kg</span>
        <input
          aria-label={`Carga da série ${set.setNumber}`}
          inputMode="decimal"
          min="0"
          step="0.5"
          type="number"
          placeholder={loadOptional ? 'PC' : undefined}
          value={set.loadKg ?? ''}
          onChange={(event) =>
            onChange(createPatch({ loadKg: parseDecimal(event.target.value) }))
          }
        />
      </label>
      <label className={styles.field}>
        <span>{isDuration ? 'Seg' : 'Reps'}</span>
        <input
          aria-label={`${isDuration ? 'Duração em segundos' : 'Repetições'} da série ${set.setNumber}`}
          inputMode="numeric"
          min="0"
          step="1"
          type="number"
          value={completedMeasure ?? ''}
          onChange={(event) =>
            onChange(
              createPatch(
                isDuration
                  ? { durationSeconds: parseInteger(event.target.value) }
                  : { repetitions: parseInteger(event.target.value) },
              ),
            )
          }
        />
      </label>
      <label className={styles.field}>
        <span>{isDuration ? 'RPE' : 'RIR'}</span>
        <input
          aria-label={`${isDuration ? 'RPE' : 'RIR'} da série ${set.setNumber}`}
          inputMode="numeric"
          max="10"
          min={minimumEffort}
          step="1"
          type="number"
          value={set.rir ?? ''}
          onChange={(event) =>
            onChange(createPatch({ rir: parseEffort(event.target.value, minimumEffort) }))
          }
        />
      </label>
      <button
        aria-label={set.completed ? `Série ${set.setNumber} concluída` : `Concluir série ${set.setNumber}`}
        className={styles.completeButton}
        disabled={!set.completed && !canComplete}
        type="button"
        onClick={onComplete}
      >
        <Check aria-hidden="true" />
      </button>
    </div>
  );
}
