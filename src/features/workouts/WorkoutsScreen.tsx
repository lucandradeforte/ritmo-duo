import type { WorkoutTemplate } from '@/types';
import { WorkoutCard } from './WorkoutCard';
import styles from './WorkoutsScreen.module.css';

interface WorkoutsScreenProps {
  workouts: readonly WorkoutTemplate[];
  onStart: (workout: WorkoutTemplate) => void;
  onView: (workout: WorkoutTemplate) => void;
}

export function WorkoutsScreen({ workouts, onStart, onView }: WorkoutsScreenProps) {
  return (
    <main className="app-content">
      <header className={styles.header}>
        <h1 className="screen-heading">Seus treinos</h1>
        <p>Terça, quinta e sexta. Nas primeiras semanas, técnica e constância vêm antes da carga.</p>
      </header>
      <div className={styles.list}>
        {workouts.map((workout) => (
          <WorkoutCard key={workout.id} workout={workout} onStart={() => onStart(workout)} onView={() => onView(workout)} />
        ))}
      </div>
    </main>
  );
}
