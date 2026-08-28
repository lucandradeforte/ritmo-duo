import { describe, expect, it } from 'vitest';
import type { CardioPrescription, StrengthPrescription } from '@/types';
import {
  getEffectiveCardioDuration,
  getEffectivePrescription,
  getEffectiveSetCount,
  getEffectiveTargetRir,
  normalizeProgramWeek,
} from './training-phase';

const strength: StrengthPrescription = {
  id: 'strength',
  kind: 'strength',
  order: 1,
  exerciseId: 'exercise',
  sets: 2,
  repetitions: { min: 8, max: 12 },
  restSeconds: 90,
  targetRir: { min: 3, max: 3 },
};

const cardio: CardioPrescription = {
  id: 'cardio',
  kind: 'cardio',
  order: 6,
  modality: 'treadmill',
  equipmentLabel: 'Esteira',
  durationMinutes: { min: 10, max: 15 },
  targetRpe: { min: 3, max: 4 },
  talkTest: 'Frases completas.',
};

describe('regras efetivas da fase', () => {
  it('normaliza a semana para o ciclo de 1 a 8', () => {
    expect(normalizeProgramWeek(Number.NaN)).toBe(1);
    expect(normalizeProgramWeek(-2)).toBe(1);
    expect(normalizeProgramWeek(4.8)).toBe(4);
    expect(normalizeProgramWeek(12)).toBe(8);
  });

  it('mantém ambos longe da falha nas semanas 1 e 2', () => {
    expect(getEffectiveTargetRir(strength.targetRir, 'lucas', 1)).toEqual({ min: 3, max: 4 });
    expect(getEffectiveTargetRir(strength.targetRir, 'geovanna', 2)).toEqual({ min: 3, max: 4 });
  });

  it('ajusta séries pela fase e pela progressão opcional de Lucas', () => {
    expect(getEffectiveSetCount(2, 'geovanna', 'goblet-squat-to-bench', 1)).toBe(1);
    expect(getEffectiveSetCount(2, 'lucas', 'goblet-squat-to-bench', 2)).toBe(2);
    expect(getEffectiveSetCount(2, 'lucas', 'goblet-squat-to-bench', 5, true)).toBe(3);
    expect(getEffectiveSetCount(2, 'lucas', 'standing-calf-raise', 5, true)).toBe(2);
  });

  it('aplica o RIR-base nas semanas 3 e 4 e individualiza semanas 5 a 8', () => {
    expect(getEffectiveTargetRir({ min: 3, max: 4 }, 'lucas', 3)).toEqual({ min: 3, max: 4 });
    expect(getEffectiveTargetRir(strength.targetRir, 'lucas', 5)).toEqual({ min: 2, max: 3 });
    expect(getEffectiveTargetRir({ min: 3, max: 4 }, 'geovanna', 8)).toEqual({ min: 3, max: 3 });
  });

  it('aplica os alvos conservadores e progressivos de cardio', () => {
    expect(getEffectiveCardioDuration(cardio.durationMinutes, 'lucas', 1)).toEqual({ min: 8, max: 8 });
    expect(getEffectiveCardioDuration(cardio.durationMinutes, 'geovanna', 2)).toEqual({ min: 10, max: 10 });
    expect(getEffectiveCardioDuration(cardio.durationMinutes, 'lucas', 3)).toEqual({ min: 12, max: 15 });
    expect(getEffectiveCardioDuration(cardio.durationMinutes, 'lucas', 5)).toEqual({ min: 15, max: 15 });
    expect(getEffectiveCardioDuration(cardio.durationMinutes, 'geovanna', 5)).toEqual({ min: 20, max: 20 });
  });

  it('retorna uma prescrição efetiva sem alterar o template-base', () => {
    const effectiveStrength = getEffectivePrescription(strength, 'lucas', 6);
    const effectiveCardio = getEffectivePrescription(cardio, 'geovanna', 6);

    expect(effectiveStrength.targetRir).toEqual({ min: 2, max: 3 });
    expect(effectiveCardio.durationMinutes).toEqual({ min: 20, max: 20 });
    expect(strength.targetRir).toEqual({ min: 3, max: 3 });
    expect(cardio.durationMinutes).toEqual({ min: 10, max: 15 });
  });
});
