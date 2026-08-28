import { formatClock } from '@/utils';
import { useWorkoutElapsedSeconds } from './useWorkoutElapsedSeconds';

interface WorkoutElapsedTimeProps {
  startedAt: number;
  completedAt?: number | null;
}

export function WorkoutElapsedTime({
  startedAt,
  completedAt = null,
}: WorkoutElapsedTimeProps) {
  return formatClock(useWorkoutElapsedSeconds({ startedAt, completedAt }));
}
