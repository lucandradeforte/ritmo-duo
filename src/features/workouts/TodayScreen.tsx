import { CalendarCheck2, ChevronRight, Flame, History } from 'lucide-react';
import type { UserProfile, WorkoutSession, WorkoutTemplate } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Surface';
import { WorkoutElapsedTime } from '@/features/active-workout/WorkoutElapsedTime';
import { WorkoutCard } from './WorkoutCard';
import styles from './TodayScreen.module.css';

interface TodayScreenProps {
  user: UserProfile;
  workout: WorkoutTemplate;
  lastSession?: WorkoutSession;
  completedThisWeek: number;
  activeWorkoutStartedAt?: number;
  activeWorkoutCode?: WorkoutSession['workoutCode'];
  onStart: () => void;
  onStartDuo: () => void;
  onContinue: () => void;
}

export function TodayScreen({
  user,
  workout,
  lastSession,
  completedThisWeek,
  activeWorkoutStartedAt,
  activeWorkoutCode,
  onStart,
  onStartDuo,
  onContinue,
}: TodayScreenProps) {
  return (
    <main className="app-content">
      <header className={styles.greeting}>
        <div>
          <span>Olá, {user.name}</span>
          <h1>Pronto para manter o ritmo?</h1>
        </div>
        <div className={styles.avatar}>{user.name.slice(0, 1)}</div>
      </header>

      {activeWorkoutStartedAt !== undefined ? (
        <Card className={styles.active} tone="timer">
          <div>
            <strong>Treino em andamento</strong>
            <span className={styles.activeMetadata}>
              Treino {activeWorkoutCode ?? workout.code} ·{' '}
              <WorkoutElapsedTime startedAt={activeWorkoutStartedAt} />
            </span>
          </div>
          <Button variant="timer" trailingIcon={<ChevronRight />} onClick={onContinue}>Continuar</Button>
        </Card>
      ) : null}

      <section className={styles.section} aria-labelledby="today-workout-heading">
        <div className={styles.sectionHeading}>
          <div>
            <span>Treino de hoje</span>
            <h2 id="today-workout-heading">Sua próxima sessão</h2>
          </div>
          <CalendarCheck2 aria-hidden="true" />
        </div>
        <WorkoutCard workout={workout} featured onStart={onStart} />
        <Button fullWidth variant="secondary" onClick={onStartDuo}>Iniciar em modo dupla</Button>
      </section>

      <section className={styles.stats} aria-label="Resumo da semana">
        <Card padding="compact">
          <Flame aria-hidden="true" />
          <div><strong>{completedThisWeek}/3</strong><span>nesta semana</span></div>
        </Card>
        <Card padding="compact">
          <History aria-hidden="true" />
          <div>
            <strong>{lastSession ? `Treino ${lastSession.workoutCode}` : '—'}</strong>
            <span>último treino</span>
          </div>
        </Card>
      </section>
    </main>
  );
}
