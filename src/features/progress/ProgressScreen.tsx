import { CalendarCheck2, ChartNoAxesColumnIncreasing, Dumbbell, Scale, Trophy } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Surface';
import type { WeightEntry } from '@/types';
import styles from './ProgressScreen.module.css';

interface ExerciseProgressItem {
  exerciseName: string;
  currentLoadKg: number | null;
  bestLoadKg: number | null;
  trendPercent: number;
}

interface ProgressScreenProps {
  completedCount: number;
  monthlyCount: number;
  totalVolumeKg: number;
  consistencyPercent: number;
  exercises: readonly ExerciseProgressItem[];
  weightEntries: readonly WeightEntry[];
  onAddWeightEntry: (weightKg: number, recordedAt: number) => Promise<void>;
}

const weightFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const formatWeight = (weightKg: number): string => weightFormatter.format(weightKg);

const toDateInputValue = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const dateInputToTimestamp = (value: string): number | null => {
  const [year, month, day] = value.split('-').map(Number);
  if (
    year === undefined ||
    month === undefined ||
    day === undefined ||
    ![year, month, day].every(Number.isInteger)
  ) {
    return null;
  }

  const date = new Date(year, month - 1, day, 12);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date.getTime()
    : null;
};

function WeightChart({ entries }: { entries: readonly WeightEntry[] }) {
  const weights = entries.map((entry) => entry.weightKg);
  const minimum = Math.min(...weights);
  const maximum = Math.max(...weights);
  const range = Math.max(maximum - minimum, 1);
  const points = entries.map((entry, index) => {
    const x = entries.length === 1 ? 50 : 6 + (index / (entries.length - 1)) * 88;
    const y = 42 - ((entry.weightKg - minimum) / range) * 30;
    return { entry, x, y };
  });
  const line = points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
  const description = entries
    .map((entry) => `${formatWeight(entry.weightKg)} kg em ${dateFormatter.format(entry.recordedAt)}`)
    .join(', ');

  return (
    <div className={styles.chart}>
      <svg viewBox="0 0 100 48" role="img" aria-label={`Evolução do peso: ${description}`}>
        <line x1="6" x2="94" y1="42" y2="42" />
        <line x1="6" x2="94" y1="27" y2="27" />
        <line x1="6" x2="94" y1="12" y2="12" />
        {points.length > 1 ? <polyline points={line} /> : null}
        {points.map((point) => (
          <circle key={point.entry.id} cx={point.x} cy={point.y} r="2.7">
            <title>{`${formatWeight(point.entry.weightKg)} kg · ${dateFormatter.format(point.entry.recordedAt)}`}</title>
          </circle>
        ))}
      </svg>
      <div className={styles.chartLabels} aria-hidden="true">
        <span>{dateFormatter.format(entries[0]!.recordedAt)}</span>
        <span>{dateFormatter.format(entries.at(-1)!.recordedAt)}</span>
      </div>
    </div>
  );
}

export function ProgressScreen({
  completedCount,
  monthlyCount,
  totalVolumeKg,
  consistencyPercent,
  exercises,
  weightEntries,
  onAddWeightEntry,
}: ProgressScreenProps) {
  const [weightValue, setWeightValue] = useState('');
  const [recordedDate, setRecordedDate] = useState(() => toDateInputValue(Date.now()));
  const [weightFeedback, setWeightFeedback] = useState<string | null>(null);
  const [isSavingWeight, setIsSavingWeight] = useState(false);
  const latestWeight = weightEntries.at(-1) ?? null;
  const firstWeight = weightEntries[0] ?? null;
  const weightChange = latestWeight && firstWeight ? latestWeight.weightKg - firstWeight.weightKg : 0;

  const handleWeightSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const weightKg = Number(weightValue.replace(',', '.'));
    const recordedAt = dateInputToTimestamp(recordedDate);
    if (!Number.isFinite(weightKg) || weightKg <= 0 || weightKg > 500) {
      setWeightFeedback('Informe um peso entre 0,1 e 500 kg.');
      return;
    }
    if (recordedAt === null) {
      setWeightFeedback('Informe uma data de pesagem válida.');
      return;
    }

    setIsSavingWeight(true);
    setWeightFeedback(null);
    try {
      await onAddWeightEntry(weightKg, recordedAt);
      setWeightValue('');
      setWeightFeedback('Pesagem registrada.');
    } catch (error) {
      setWeightFeedback(error instanceof Error ? error.message : 'Não foi possível registrar a pesagem.');
    } finally {
      setIsSavingWeight(false);
    }
  };

  return (
    <main className="app-content">
      <header className={styles.header}>
        <h1 className="screen-heading">Progresso</h1>
        <p>Métricas que ajudam a manter constância e progredir com segurança.</p>
      </header>
      <section className={styles.metrics} aria-label="Métricas principais">
        <Card><CalendarCheck2 /><strong>{completedCount}</strong><span>treinos concluídos</span></Card>
        <Card><ChartNoAxesColumnIncreasing /><strong>{monthlyCount}</strong><span>neste mês</span></Card>
        <Card><Dumbbell /><strong>{Math.round(totalVolumeKg).toLocaleString('pt-BR')}</strong><span>kg de volume</span></Card>
        <Card><Trophy /><strong>{consistencyPercent}%</strong><span>consistência</span></Card>
      </section>

      <section className={styles.weightProgress} aria-labelledby="weight-progress-heading">
        <div className={styles.sectionHeading}>
          <div>
            <h2 id="weight-progress-heading"><Scale /> Peso corporal</h2>
            <p>Registre medições para acompanhar sua evolução.</p>
          </div>
          {latestWeight ? <strong>{formatWeight(latestWeight.weightKg)} kg</strong> : null}
        </div>
        <Card className={styles.weightFormCard}>
          <form className={styles.weightForm} onSubmit={(event) => void handleWeightSubmit(event)}>
            <label>
              <span>Peso (kg)</span>
              <input
                aria-label="Peso em quilogramas"
                inputMode="decimal"
                min="0.1"
                max="500"
                step="0.1"
                type="number"
                value={weightValue}
                onChange={(event) => setWeightValue(event.target.value)}
              />
            </label>
            <label>
              <span>Data da pesagem</span>
              <input
                aria-label="Data da pesagem"
                type="date"
                value={recordedDate}
                onChange={(event) => setRecordedDate(event.target.value)}
              />
            </label>
            <Button fullWidth isLoading={isSavingWeight} loadingLabel="Registrando" type="submit">
              Registrar peso
            </Button>
          </form>
          {weightFeedback ? <p className={styles.weightFeedback} role="status">{weightFeedback}</p> : null}
        </Card>

        {latestWeight ? (
          <Card className={styles.weightChartCard}>
            <div className={styles.weightSummary}>
              <div>
                <span>Último registro</span>
                <strong>{dateFormatter.format(latestWeight.recordedAt)}</strong>
              </div>
              {weightEntries.length > 1 ? (
                <span
                  className={styles.weightTrend}
                  data-direction={weightChange === 0 ? 'steady' : weightChange < 0 ? 'down' : 'up'}
                >
                  {weightChange === 0
                    ? 'Peso estável desde o primeiro registro'
                    : `${weightChange < 0 ? '−' : '+'}${formatWeight(Math.abs(weightChange))} kg desde o primeiro registro`}
                </span>
              ) : null}
            </div>
            <WeightChart entries={weightEntries} />
          </Card>
        ) : (
          <Card className={styles.emptyWeight} tone="muted">
            <Scale />
            <p>Registre a primeira pesagem para começar a visualizar sua evolução aqui.</p>
          </Card>
        )}
      </section>

      <section className={styles.consistency} aria-labelledby="consistency-heading">
        <div><h2 id="consistency-heading">Consistência do ciclo</h2><span>{consistencyPercent}%</span></div>
        <div className={styles.track}><span style={{ inlineSize: `${Math.min(100, consistencyPercent)}%` }} /></div>
        <p>Base: três sessões planejadas por semana.</p>
      </section>
      <section className={styles.exerciseProgress} aria-labelledby="exercise-progress-heading">
        <h2 id="exercise-progress-heading">Carga por exercício</h2>
        {exercises.length === 0 ? <p>Conclua alguns treinos para acompanhar a evolução de carga.</p> : (
          <div className={styles.rows}>{exercises.map((item) => (
            <Card key={item.exerciseName} padding="compact">
              <div><strong>{item.exerciseName}</strong><span>Atual {item.currentLoadKg ?? '—'} kg</span></div>
              <div className={styles.best}><strong>{item.bestLoadKg ?? '—'} kg</strong><span>melhor carga</span></div>
            </Card>
          ))}</div>
        )}
      </section>
    </main>
  );
}
