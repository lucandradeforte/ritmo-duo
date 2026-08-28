import { Bike, Check, Gauge, Timer, TrendingUp } from 'lucide-react';
import type { CardioPrescription, CardioSession } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Surface';
import { useWorkoutElapsedSeconds } from './useWorkoutElapsedSeconds';
import styles from './CardioTracker.module.css';

interface CardioTrackerProps {
  prescription: CardioPrescription;
  session: CardioSession;
  onStart: () => void;
  onUpdate: (changes: Partial<CardioSession>) => void;
  onComplete: () => void;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
}

function parseNumber(value: string): number | null {
  if (!value.trim()) return null;
  const result = Number(value.replace(',', '.'));
  return Number.isFinite(result) && result >= 0 ? result : null;
}

function parseRpe(value: string): number | null {
  if (!value.trim()) return null;
  const result = Number(value);
  return Number.isInteger(result) && result >= 1 && result <= 10 ? result : null;
}

interface CardioLiveMetricsProps {
  prescription: CardioPrescription;
  session: CardioSession;
  onStart: () => void;
}

function CardioLiveMetrics({ prescription, session, onStart }: CardioLiveMetricsProps) {
  const Icon = prescription.modality === 'bike' ? Bike : TrendingUp;
  const elapsedSeconds = useWorkoutElapsedSeconds({
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    fallbackSeconds: session.durationSeconds ?? 0,
  });
  const targetSeconds = session.targetDurationSeconds;
  const progress = Math.min(100, (elapsedSeconds / targetSeconds) * 100);

  return (
    <Card className={styles.hero} tone="timer" padding="spacious">
      <div className={styles.icon}><Icon aria-hidden="true" /></div>
      <span>{prescription.modality === 'bike' ? 'Bicicleta' : 'Esteira'}</span>
      <strong className="numeric">{formatTime(elapsedSeconds)}</strong>
      <small>Meta {Math.round(targetSeconds / 60)}:00 · RPE {prescription.targetRpe.min}–{prescription.targetRpe.max}</small>
      <div className={styles.progress} aria-label={`${Math.round(progress)}% da meta`}>
        <span style={{ inlineSize: `${progress}%` }} />
      </div>
      {!session.startedAt ? (
        <Button fullWidth variant="timer" leadingIcon={<Timer />} onClick={onStart}>Iniciar cardio</Button>
      ) : null}
    </Card>
  );
}

export function CardioTracker({ prescription, session, onStart, onUpdate, onComplete }: CardioTrackerProps) {
  return (
    <div className={styles.wrapper}>
      <CardioLiveMetrics prescription={prescription} session={session} onStart={onStart} />

      <div className={styles.inputs}>
        <label><span>Distância (km)</span><input inputMode="decimal" type="number" min="0" step="0.1" value={session.distanceKm ?? ''} onChange={(event) => onUpdate({ distanceKm: parseNumber(event.target.value) })} /></label>
        {prescription.modality === 'treadmill' ? (
          <>
            <label><span>Velocidade</span><input inputMode="decimal" type="number" min="0" step="0.1" value={session.speedKmh ?? ''} onChange={(event) => onUpdate({ speedKmh: parseNumber(event.target.value) })} /></label>
            <label><span>Inclinação %</span><input inputMode="decimal" type="number" min="0" step="0.5" value={session.inclinePercent ?? ''} onChange={(event) => onUpdate({ inclinePercent: parseNumber(event.target.value) })} /></label>
          </>
        ) : (
          <label><span>Intensidade</span><input inputMode="numeric" type="number" min="0" value={session.intensityLevel ?? ''} onChange={(event) => onUpdate({ intensityLevel: parseNumber(event.target.value) })} /></label>
        )}
        <label><span>RPE</span><input inputMode="numeric" type="number" min="1" max="10" step="1" value={session.rpe ?? ''} onChange={(event) => onUpdate({ rpe: parseRpe(event.target.value) })} /></label>
      </div>

      <Card className={styles.talkTest} padding="compact" tone="muted">
        <Gauge aria-hidden="true" />
        <p><strong>Talk Test</strong>{prescription.talkTest}</p>
      </Card>

      <Button
        fullWidth
        size="large"
        leadingIcon={<Check />}
        disabled={!session.startedAt || session.completedAt !== null}
        onClick={onComplete}
      >
        {session.completedAt ? 'Cardio concluído' : 'Concluir cardio'}
      </Button>
    </div>
  );
}
