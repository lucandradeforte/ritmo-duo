import { describe, expect, it } from 'vitest';
import {
  exercises,
  exercisesById,
  geovannaWorkoutPlan,
  getWorkoutTemplate,
  lucasWorkoutPlan,
  users,
} from '@/data';

describe('dados iniciais do programa', () => {
  it('mantém os dois perfis com objetivos e cardio individuais', () => {
    expect(users).toHaveLength(2);
    expect(users.find((user) => user.id === 'lucas')).toMatchObject({
      preferredCardio: 'treadmill',
      secondaryGoals: ['muscle-gain'],
    });
    expect(users.find((user) => user.id === 'geovanna')).toMatchObject({
      preferredCardio: 'bike',
      secondaryGoals: ['health'],
    });
  });

  it('possui catálogo completo e referências válidas nos treinos', () => {
    expect(exercises).toHaveLength(12);
    expect(new Set(exercises.map((exercise) => exercise.id)).size).toBe(exercises.length);
    expect(exercises.every((exercise) => exercise.media?.url.startsWith('https://'))).toBe(true);

    for (const plan of [lucasWorkoutPlan, geovannaWorkoutPlan]) {
      expect(plan.templates.map((template) => template.code)).toEqual(['A', 'B', 'C']);
      plan.templates.forEach((template) => {
        expect(template.exercises).toHaveLength(6);
        template.exercises.forEach((prescription) => {
          if (prescription.kind !== 'cardio') {
            expect(exercisesById[prescription.exerciseId]).toBeDefined();
          }
        });
      });
    }
  });

  it('preserva as diferenças das prescrições entre os usuários', () => {
    const lucasA = getWorkoutTemplate('lucas', 'A');
    const geovannaA = getWorkoutTemplate('geovanna', 'A');
    const lucasPulldown = lucasA?.exercises.find(
      (item) => item.kind === 'strength' && item.exerciseId === 'tander-lat-pulldown',
    );
    const geovannaPulldown = geovannaA?.exercises.find(
      (item) => item.kind === 'strength' && item.exerciseId === 'tander-lat-pulldown',
    );

    expect(lucasPulldown?.kind === 'strength' && lucasPulldown.repetitions).toEqual({
      min: 8,
      max: 12,
    });
    expect(geovannaPulldown?.kind === 'strength' && geovannaPulldown.repetitions).toEqual({
      min: 10,
      max: 12,
    });
  });
});
