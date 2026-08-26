import { ArrowRight, Clock3, Dumbbell } from 'lucide-react';
import type { WorkoutTemplate } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Surface';
import styles from './WorkoutCard.module.css';

interface WorkoutCardProps {
  workout: WorkoutTemplate;
  featured?: boolean;
  actionLabel?: string;
  onStart: () => void;
  onView?: () => void;
}

export function WorkoutCard({ workout, featured = false, actionLabel = 'Iniciar treino', onStart, onView }: WorkoutCardProps) {
  const minMinutes = workout.estimatedMinutes.min;
  const maxMinutes = workout.estimatedMinutes.max;
  const strengthCount = workout.exercises.filter((item) => item.kind !== 'cardio').length;

  return (
    <Card className={styles.card} padding={featured ? 'spacious' : 'default'} tone={featured ? 'accent' : 'default'}>
      <div className={styles.header}>
        <div className={styles.code}>Treino {workout.code}</div>
        <div className={styles.duration}><Clock3 aria-hidden="true" /> {minMinutes}–{maxMinutes} min</div>
      </div>
      <h2>{workout.title}</h2>
      <p className={styles.focus}>{workout.focus.join(' • ')}</p>
      <div className={styles.meta}><Dumbbell aria-hidden="true" /> {strengthCount} exercícios + cardio</div>
      <div className={styles.actions}>
        <Button fullWidth size={featured ? 'large' : 'default'} leadingIcon={<Dumbbell />} onClick={onStart}>
          {actionLabel}
        </Button>
        {onView ? (
          <Button variant="ghost" trailingIcon={<ArrowRight />} onClick={onView}>
            Ver ficha
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
