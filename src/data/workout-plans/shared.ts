import type {
  CardioModality,
  CardioPrescription,
  CarryPrescription,
  RepRange,
  StrengthPrescription,
  TrainingPhase,
  UserId,
  WarmupPrescription,
  WorkoutCode,
} from '@/types';

export const range = (min: number, max = min): RepRange => ({ min, max });

export const createWarmup = (modality: CardioModality): WarmupPrescription => ({
  general: {
    modality,
    durationMinutes: range(5, 7),
    targetRpe: range(2, 3),
    instructions: [
      modality === 'treadmill'
        ? 'Caminhe em ritmo confortável; não use velocidade 8 nesta fase inicial.'
        : 'Pedale com resistência leve, sem prender a respiração.',
      'O objetivo é elevar gradualmente a temperatura e a respiração, não gerar fadiga.',
    ],
  },
  specific: {
    repetitions: range(8, 10),
    instructions: [
      'Faça uma série preparatória leve antes do primeiro exercício de pernas.',
      'Faça uma série preparatória leve antes do primeiro exercício de membros superiores.',
      'As séries preparatórias não contam como séries de trabalho.',
    ],
  },
});

interface StrengthInput {
  userId: UserId;
  workoutCode: WorkoutCode;
  order: number;
  exerciseId: string;
  sets?: number;
  repetitions: RepRange;
  restSeconds: number;
  targetRir: RepRange;
  notes?: string[];
}

export const strength = ({
  userId,
  workoutCode,
  order,
  exerciseId,
  sets = 2,
  repetitions,
  restSeconds,
  targetRir,
  notes,
}: StrengthInput): StrengthPrescription => ({
  id: `${userId}-${workoutCode.toLowerCase()}-${exerciseId}`,
  kind: 'strength',
  order,
  exerciseId,
  sets,
  repetitions,
  restSeconds,
  targetRir,
  userNotes: notes,
});

interface CarryInput {
  userId: UserId;
  workoutCode: WorkoutCode;
  order: number;
  durationSeconds: RepRange;
  targetRpe: RepRange;
}

export const carry = ({
  userId,
  workoutCode,
  order,
  durationSeconds,
  targetRpe,
}: CarryInput): CarryPrescription => ({
  id: `${userId}-${workoutCode.toLowerCase()}-farmer-carry`,
  kind: 'carry',
  order,
  exerciseId: 'farmer-carry',
  sets: 2,
  durationSeconds,
  restSeconds: 60,
  targetRpe,
});

interface CardioInput {
  userId: UserId;
  workoutCode: WorkoutCode;
  order: number;
  modality: CardioModality;
  durationMinutes: RepRange;
  targetRpe: RepRange;
  notes: string[];
}

export const cardio = ({
  userId,
  workoutCode,
  order,
  modality,
  durationMinutes,
  targetRpe,
  notes,
}: CardioInput): CardioPrescription => ({
  id: `${userId}-${workoutCode.toLowerCase()}-${modality}`,
  kind: 'cardio',
  order,
  modality,
  equipmentLabel: modality === 'treadmill' ? 'Esteira Movement' : 'Bicicleta Evolution Fitness B-302',
  durationMinutes,
  targetRpe,
  talkTest: 'Deve ser possível falar frases completas, ainda que com a respiração um pouco mais forte.',
  userNotes: notes,
});

export const adaptationPhases: readonly TrainingPhase[] = [
  {
    id: 'adaptation-weeks-1-2',
    weeks: range(1, 2),
    title: 'Adaptação técnica',
    instructions: [
      'Semana 1: uma série de trabalho por exercício.',
      'Semana 2: duas séries de trabalho por exercício.',
      'Trabalhar em RIR 4–3, longe da falha.',
      'Cardio de 8–12 minutos na semana 1 e 10–15 minutos na semana 2.',
      'Sem corrida, HIIT, saltos, drop sets ou treino até a falha.',
    ],
  },
  {
    id: 'adaptation-weeks-3-4',
    weeks: range(3, 4),
    title: 'Consolidação do volume inicial',
    instructions: [
      'Usar as duas séries prescritas nas fichas.',
      'Cardio de 12–20 minutos.',
      'Manter RIR 3 e priorizar execução consistente.',
    ],
  },
  {
    id: 'progression-weeks-5-8',
    weeks: range(5, 8),
    title: 'Progressão estruturada',
    instructions: [
      'Lucas pode adicionar uma terceira série aos exercícios prioritários indicados.',
      'Geovanna mantém duas séries e pode elevar o cardio para 20–25 minutos.',
      'Lucas trabalha em RIR 2–3 nos exercícios principais; Geovanna permanece preferencialmente em RIR 3.',
      'Se a dor muscular incapacitante durar mais de 72 horas, manter o volume da semana anterior.',
    ],
  },
];

export const sharedProgressionNotes: readonly string[] = [
  'Use progressão dupla: aumente repetições dentro da faixa antes de aumentar a carga.',
  'Quando todas as séries alcançarem o topo da faixa com técnica e RIR adequados, sugira uma carga maior no treino seguinte.',
  'Halteres: use o menor par seguinte disponível.',
  'Barra e anilhas: aumente 1–2 kg totais em movimentos de membros superiores e 2–5 kg em movimentos de membros inferiores, se houver anilhas adequadas.',
  'Torre Tander: suba uma posição do pino; se o salto for grande, consolide repetições e técnica antes da troca.',
  'Cardio: acrescente 2–3 minutos por sessão; não aumente duração e intensidade simultaneamente.',
];

export const sharedSafetyNotes: readonly string[] = [
  'Esforço muscular, aumento controlado da respiração e queimação localizada podem ocorrer.',
  'Interrompa diante de dor aguda ou articular, dor no peito, falta de ar fora do padrão, tontura, náusea, sensação de desmaio, palpitação irregular ou dor irradiada.',
  'Na multiestação Tander, treine uma pessoa por vez e confira pino, cabo, mosquetões, banco e parafusos antes de usar.',
  'Interrompa o uso da Tander em caso de folga, ruído metálico incomum, travamento ou oscilação.',
];
