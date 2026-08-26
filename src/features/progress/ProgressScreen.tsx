import { CalendarCheck2, ChartNoAxesColumnIncreasing, Dumbbell, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/Surface';
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
}

export function ProgressScreen({ completedCount, monthlyCount, totalVolumeKg, consistencyPercent, exercises }: ProgressScreenProps) {
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
