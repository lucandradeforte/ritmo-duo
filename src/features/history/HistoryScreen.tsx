import { CalendarDays, Clock3, Dumbbell } from 'lucide-react';
import type { WorkoutSession } from '@/types';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Card } from '@/components/ui/Surface';
import styles from './HistoryScreen.module.css';

interface HistoryScreenProps {
  sessions: readonly WorkoutSession[];
  onOpen: (session: WorkoutSession) => void;
  getVolume: (session: WorkoutSession) => number;
}

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(timestamp);
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—';
  return `${Math.round(seconds / 60)} min`;
}

export function HistoryScreen({ sessions, onOpen, getVolume }: HistoryScreenProps) {
  return (
    <main className="app-content">
      <header className={styles.header}>
        <h1 className="screen-heading">Histórico</h1>
        <p>Cargas, repetições e RIR salvos em cada sessão.</p>
      </header>
      {sessions.length === 0 ? (
        <EmptyState icon={<CalendarDays />} title="Nenhum treino concluído" description="Seu primeiro treino aparecerá aqui assim que você finalizar a sessão." />
      ) : (
        <div className={styles.list}>
          {sessions.map((session) => {
            const completedSets = session.exercises.reduce((total, exercise) => total + exercise.sets.filter((set) => set.completed).length, 0);
            return (
              <button key={session.id} className={styles.item} type="button" onClick={() => onOpen(session)}>
                <Card as="div" className={styles.card}>
                  <div className={styles.code}>{session.workoutCode}</div>
                  <div className={styles.copy}>
                    <strong>Treino {session.workoutCode}</strong>
                    <span><CalendarDays /> {formatDate(session.startedAt)}</span>
                    <small><Clock3 /> {formatDuration(session.durationSeconds)} · <Dumbbell /> {completedSets} séries</small>
                  </div>
                  <div className={styles.volume}><strong>{Math.round(getVolume(session)).toLocaleString('pt-BR')}</strong><span>kg volume</span></div>
                </Card>
              </button>
            );
          })}
        </div>
      )}
    </main>
  );
}
