import type { RestTimerState } from '@/types';

export interface CreateRestTimerInput {
  durationSeconds: number;
  userId: RestTimerState['userId'];
  exerciseSessionId: string;
  setSessionId: string;
  startedAt?: number;
}

const sanitizeDuration = (durationSeconds: number): number =>
  Math.max(0, Math.round(Number.isFinite(durationSeconds) ? durationSeconds : 0));

export const createRestTimer = ({
  durationSeconds,
  userId,
  exerciseSessionId,
  setSessionId,
  startedAt = Date.now(),
}: CreateRestTimerInput): RestTimerState => ({
  restStartedAt: startedAt,
  restDurationSeconds: sanitizeDuration(durationSeconds),
  userId,
  exerciseSessionId,
  setSessionId,
});

export const getRestRemainingMilliseconds = (
  timer: RestTimerState,
  now = Date.now(),
): number => {
  const durationMilliseconds = timer.restDurationSeconds * 1_000;
  const elapsedMilliseconds = Math.max(0, now - timer.restStartedAt);
  return Math.max(0, durationMilliseconds - elapsedMilliseconds);
};

export const getRestRemainingSeconds = (
  timer: RestTimerState,
  now = Date.now(),
): number => Math.ceil(getRestRemainingMilliseconds(timer, now) / 1_000);

export const isRestComplete = (timer: RestTimerState, now = Date.now()): boolean =>
  getRestRemainingMilliseconds(timer, now) === 0;

export const adjustRestDuration = (
  timer: RestTimerState,
  deltaSeconds: number,
): RestTimerState => ({
  ...timer,
  restDurationSeconds: sanitizeDuration(timer.restDurationSeconds + deltaSeconds),
});

export const getElapsedSeconds = (
  startedAt: number,
  now = Date.now(),
  completedAt: number | null = null,
): number => Math.max(0, Math.floor(((completedAt ?? now) - startedAt) / 1_000));

export const formatClock = (totalSeconds: number): string => {
  const sanitized = sanitizeDuration(totalSeconds);
  const hours = Math.floor(sanitized / 3_600);
  const minutes = Math.floor((sanitized % 3_600) / 60);
  const seconds = sanitized % 60;

  if (hours > 0) {
    return [hours, minutes, seconds].map((part) => part.toString().padStart(2, '0')).join(':');
  }

  return [minutes, seconds].map((part) => part.toString().padStart(2, '0')).join(':');
};
