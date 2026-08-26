import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getExercise, getWorkoutTemplate, users } from '@/data';
import { createActiveWorkout } from '@/utils';
import type { SetSession, StrengthPrescription } from '@/types';
import { ActiveWorkoutScreen } from './ActiveWorkoutScreen';

describe('histórico anterior por série', () => {
  it('associa o resultado anterior pelo setNumber quando houve série pulada', () => {
    const template = getWorkoutTemplate('lucas', 'A');
    expect(template).toBeDefined();
    if (!template) return;

    const prescription = template.exercises[0] as StrengthPrescription;
    const state = createActiveWorkout([template], { now: 1_000, programWeek: 2 });
    const exerciseSession = state.sessions.lucas?.exercises[0];
    const exercise = getExercise(prescription.exerciseId);
    expect(exerciseSession).toBeDefined();
    expect(exercise).toBeDefined();
    if (!exerciseSession || !exercise) return;

    const previousSetTwo: SetSession = {
      ...exerciseSession.sets[1]!,
      loadKg: 22,
      repetitions: 9,
      rir: 3,
      completed: true,
      completedAt: 900,
    };
    const noop = vi.fn();

    render(
      <ActiveWorkoutScreen
        state={state}
        profiles={users}
        template={template}
        prescription={prescription}
        exercise={exercise}
        exerciseSession={exerciseSession}
        previousSets={[previousSetTwo]}
        restTimer={null}
        elapsedLabel="00:00"
        cardioElapsedSeconds={0}
        online
        onBack={noop}
        onSwitchUser={noop}
        onSetChange={noop}
        onSetComplete={noop}
        onPreviousExercise={noop}
        onNextExercise={noop}
        onFinish={noop}
        onRestAdjust={noop}
        onRestSkip={noop}
        onRestFinished={noop}
        onCardioStart={noop}
        onCardioUpdate={noop}
        onCardioComplete={noop}
      />,
    );

    const rowOne = screen.getByLabelText('Carga da série 1').closest('div');
    const rowTwo = screen.getByLabelText('Carga da série 2').closest('div');
    expect(rowOne).toHaveTextContent('— kg × —');
    expect(rowOne).not.toHaveTextContent('22 kg × 9');
    expect(rowTwo).toHaveTextContent('22 kg × 9');
  });
});
