import { describe, expect, it } from 'vitest';
import type { SetSession, StrengthPrescription } from '@/types';
import { evaluateDoubleProgression } from './progression';
import { getEffectivePrescription } from './training-phase';

const prescription: StrengthPrescription = {
  id: 'test-prescription',
  kind: 'strength',
  order: 1,
  exerciseId: 'test-exercise',
  sets: 3,
  repetitions: { min: 8, max: 12 },
  restSeconds: 90,
  targetRir: { min: 2, max: 3 },
};

const completedSet = (setNumber: number, repetitions: number, rir: number): SetSession => ({
  id: `set-${setNumber}`,
  setNumber,
  loadKg: 25,
  repetitions,
  durationSeconds: null,
  rir,
  completed: true,
  completedAt: 1_000,
});

describe('progressão dupla', () => {
  it('sugere progressão quando todas as séries alcançam o topo com RIR adequado', () => {
    const result = evaluateDoubleProgression(
      prescription,
      [completedSet(1, 12, 3), completedSet(2, 12, 2), completedSet(3, 12, 2)],
      { equipment: 'dumbbell', nextAvailableLoadKg: 30 },
    );

    expect(result).toMatchObject({
      eligible: true,
      currentLoadKg: 25,
      suggestedLoadKg: 30,
    });
  });

  it('mantém a carga quando faltam repetições', () => {
    const result = evaluateDoubleProgression(
      prescription,
      [completedSet(1, 12, 3), completedSet(2, 11, 3), completedSet(3, 10, 3)],
      { equipment: 'dumbbell', nextAvailableLoadKg: 30 },
    );

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('12 repetições');
  });

  it('não sugere aumento quando o topo foi atingido perto demais da falha', () => {
    const result = evaluateDoubleProgression(
      prescription,
      [completedSet(1, 12, 1), completedSet(2, 12, 1), completedSet(3, 12, 0)],
      { equipment: 'machine' },
    );

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('esforço maior');
  });

  it('não sugere aumento quando as séries usaram cargas diferentes', () => {
    const sets = [completedSet(1, 12, 3), completedSet(2, 12, 3), completedSet(3, 12, 3)];
    sets[1]!.loadKg = 20;

    const result = evaluateDoubleProgression(prescription, sets, { equipment: 'dumbbell' });

    expect(result.eligible).toBe(false);
    expect(result.message).toContain('consolide');
  });

  it('não sugere progressão com RIR fora da escala', () => {
    const result = evaluateDoubleProgression(
      prescription,
      [completedSet(1, 12, 999), completedSet(2, 12, 3), completedSet(3, 12, 3)],
      { equipment: 'machine' },
    );

    expect(result.eligible).toBe(false);
    expect(result.message).toContain('Revise o RIR');
  });

  it('usa o RIR efetivo da fase ao avaliar Lucas nas semanas 5 a 8', () => {
    const basePrescription: StrengthPrescription = {
      ...prescription,
      targetRir: { min: 3, max: 3 },
    };
    const effectivePrescription = getEffectivePrescription(basePrescription, 'lucas', 5);
    const result = evaluateDoubleProgression(
      effectivePrescription,
      [completedSet(1, 12, 2), completedSet(2, 12, 2), completedSet(3, 12, 2)],
      { equipment: 'machine' },
    );

    expect(effectivePrescription.targetRir).toEqual({ min: 2, max: 3 });
    expect(result.eligible).toBe(true);
  });
});
