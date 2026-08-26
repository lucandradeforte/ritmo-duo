import { describe, expect, it } from 'vitest';
import { getWorkoutTemplate } from '@/data';
import { createActiveWorkout } from './session';
import { getPendingParticipantIds, isSessionReadyForCompletion } from './workout-completion';

describe('conclusão do treino', () => {
  it('mantém a sessão pendente sem feedback ou cardio concluído', () => {
    const template = getWorkoutTemplate('lucas', 'A');
    if (!template) throw new Error('Template ausente');
    const state = createActiveWorkout([template], { now: 1_000 });
    const session = state.sessions.lucas;
    if (!session?.cardio) throw new Error('Sessão de cardio ausente');

    expect(isSessionReadyForCompletion(session)).toBe(false);
    expect(getPendingParticipantIds(state)).toEqual(['lucas']);
  });

  it('só libera a conclusão dupla depois dos dois participantes', () => {
    const lucasTemplate = getWorkoutTemplate('lucas', 'A');
    const geovannaTemplate = getWorkoutTemplate('geovanna', 'A');
    if (!lucasTemplate || !geovannaTemplate) throw new Error('Templates ausentes');
    const state = createActiveWorkout([lucasTemplate, geovannaTemplate], { now: 1_000 });
    const lucas = state.sessions.lucas;
    const geovanna = state.sessions.geovanna;
    if (!lucas?.cardio || !geovanna?.cardio) throw new Error('Cardio ausente');

    const onlyLucasReady = {
      ...state,
      sessions: {
        ...state.sessions,
        lucas: {
          ...lucas,
          cardio: { ...lucas.cardio, completedAt: 2_000 },
          feedback: { feeling: 'good' as const, overallRpe: 6, notes: '' },
        },
      },
    };

    expect(getPendingParticipantIds(onlyLucasReady)).toEqual(['geovanna']);

    const bothReady = {
      ...onlyLucasReady,
      sessions: {
        ...onlyLucasReady.sessions,
        geovanna: {
          ...geovanna,
          cardio: { ...geovanna.cardio, completedAt: 2_500 },
          feedback: { feeling: 'good' as const, overallRpe: 6, notes: '' },
        },
      },
    };

    expect(getPendingParticipantIds(bothReady)).toEqual([]);
  });
});
