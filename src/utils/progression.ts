import type {
  ProgressionEquipment,
  ProgressionSuggestion,
  SetSession,
  StrengthPrescription,
} from '@/types';

export interface ProgressionOptions {
  equipment: ProgressionEquipment;
  nextAvailableLoadKg?: number;
}

const getCurrentLoad = (sets: SetSession[]): number | null => {
  const completedLoads = sets.flatMap((set) =>
    set.completed && set.loadKg !== null ? [set.loadKg] : [],
  );
  return completedLoads.length > 0 ? Math.max(...completedLoads) : null;
};

const getSuggestedLoad = (
  currentLoadKg: number,
  options: ProgressionOptions,
): number | null => {
  if (
    typeof options.nextAvailableLoadKg === 'number' &&
    options.nextAvailableLoadKg > currentLoadKg
  ) {
    return options.nextAvailableLoadKg;
  }

  switch (options.equipment) {
    case 'barbell-upper':
      return currentLoadKg + 2;
    case 'barbell-lower':
      return currentLoadKg + 4;
    case 'dumbbell':
    case 'machine':
    case 'bodyweight':
      return null;
  }
};

export const evaluateDoubleProgression = (
  prescription: StrengthPrescription,
  sets: SetSession[],
  options: ProgressionOptions,
): ProgressionSuggestion => {
  const workSets = sets.slice(0, prescription.sets);
  const currentLoadKg = getCurrentLoad(workSets);

  if (workSets.length < prescription.sets || workSets.some((set) => !set.completed)) {
    return {
      eligible: false,
      currentLoadKg,
      suggestedLoadKg: null,
      message: 'Mantenha a carga atual.',
      reason: 'Complete todas as séries prescritas antes de avaliar a progressão.',
    };
  }

  if (workSets.some((set) => set.repetitions === null || set.repetitions < prescription.repetitions.max)) {
    return {
      eligible: false,
      currentLoadKg,
      suggestedLoadKg: null,
      message: 'Mantenha a carga e busque mais repetições.',
      reason: `Ainda não foram atingidas ${prescription.repetitions.max} repetições em todas as séries.`,
    };
  }

  if (workSets.some((set) => set.rir === null || set.rir < prescription.targetRir.min)) {
    return {
      eligible: false,
      currentLoadKg,
      suggestedLoadKg: null,
      message: 'Mantenha a carga atual.',
      reason: 'O topo da faixa foi atingido, mas com esforço maior que o RIR prescrito.',
    };
  }

  if (workSets.some((set) => set.rir === null || set.rir > 10)) {
    return {
      eligible: false,
      currentLoadKg,
      suggestedLoadKg: null,
      message: 'Revise o RIR registrado.',
      reason: 'A escala de RIR aceita somente valores entre 0 e 10.',
    };
  }

  const uniqueLoads = new Set(workSets.map((set) => set.loadKg));
  if (options.equipment !== 'bodyweight' && uniqueLoads.size > 1) {
    return {
      eligible: false,
      currentLoadKg,
      suggestedLoadKg: null,
      message: 'Mantenha a carga e consolide todas as séries.',
      reason: 'A progressão só é sugerida quando todas as séries usam a mesma carga.',
    };
  }

  if (options.equipment !== 'bodyweight' && currentLoadKg === null) {
    return {
      eligible: false,
      currentLoadKg: null,
      suggestedLoadKg: null,
      message: 'Registre a carga para receber uma sugestão.',
      reason: 'Não há carga registrada nas séries concluídas.',
    };
  }

  if (options.equipment === 'bodyweight') {
    return {
      eligible: true,
      currentLoadKg,
      suggestedLoadKg: null,
      message: 'Progressão sugerida: use a próxima variação técnica indicada.',
      reason: 'Todas as séries atingiram o topo da faixa com o RIR adequado.',
    };
  }

  const suggestedLoadKg = getSuggestedLoad(currentLoadKg ?? 0, options);
  const message =
    suggestedLoadKg === null
      ? options.equipment === 'machine'
        ? 'Progressão sugerida: suba uma posição do pino no próximo treino.'
        : 'Progressão sugerida: use o próximo par de halteres disponível.'
      : `Progressão sugerida: ${currentLoadKg ?? 0} kg → ${suggestedLoadKg} kg.`;

  return {
    eligible: true,
    currentLoadKg,
    suggestedLoadKg,
    message,
    reason: 'Todas as séries atingiram o topo da faixa com o RIR adequado e boa técnica.',
  };
};
