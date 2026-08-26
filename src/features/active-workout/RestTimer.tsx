import { useEffect, useMemo, useState } from 'react';
import { TimerReset } from 'lucide-react';
import type { RestTimerState } from '@/types';
import { Button } from '@/components/ui/Button';
import styles from './RestTimer.module.css';

interface RestTimerProps {
  timer: RestTimerState;
  onAdjust: (seconds: number) => void;
  onSkip: () => void;
  onFinished?: () => void;
}

function calculateRemaining(timer: RestTimerState): number {
  const elapsedSeconds = Math.floor((Date.now() - timer.restStartedAt) / 1000);
  return Math.max(0, timer.restDurationSeconds - elapsedSeconds);
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function RestTimer({ timer, onAdjust, onSkip, onFinished }: RestTimerProps) {
  const [remaining, setRemaining] = useState(() => calculateRemaining(timer));

  useEffect(() => {
    let notified = false;
    const sync = () => {
      const nextRemaining = calculateRemaining(timer);
      setRemaining(nextRemaining);
      if (nextRemaining === 0 && !notified) {
        notified = true;
        onFinished?.();
      }
    };
    sync();
    const intervalId = window.setInterval(sync, 250);
    const handleVisibility = () => sync();
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, [onFinished, timer]);

  const progress = useMemo(() => {
    if (timer.restDurationSeconds <= 0) return 1;
    return 1 - remaining / timer.restDurationSeconds;
  }, [remaining, timer.restDurationSeconds]);

  return (
    <section className={styles.timer} aria-live="polite" aria-label="Cronômetro de descanso">
      <div className={styles.icon} aria-hidden="true">
        <TimerReset />
      </div>
      <div className={styles.content}>
        <span className={styles.label}>{remaining === 0 ? 'Descanso concluído' : 'Descanso'}</span>
        <strong className={styles.value}>{formatDuration(remaining)}</strong>
        <div className={styles.adjustments}>
          <button type="button" onClick={() => onAdjust(-15)}>-15 s</button>
          <button type="button" onClick={() => onAdjust(15)}>+15 s</button>
        </div>
      </div>
      <Button size="compact" variant="ghost" onClick={onSkip}>
        Pular
      </Button>
      <div className={styles.progressTrack} aria-hidden="true">
        <div className={styles.progressValue} style={{ inlineSize: `${Math.min(100, progress * 100)}%` }} />
      </div>
    </section>
  );
}
