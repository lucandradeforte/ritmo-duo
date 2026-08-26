import type { WorkoutPlan, WorkoutTemplate } from '@/types';
import {
  adaptationPhases,
  cardio,
  carry,
  createWarmup,
  range,
  sharedProgressionNotes,
  sharedSafetyNotes,
  strength,
} from './shared';

const warmup = createWarmup('bike');
const initialRir = range(3, 4);

const templates: WorkoutTemplate[] = [
  {
    id: 'geovanna-workout-a',
    userId: 'geovanna',
    code: 'A',
    weekday: 'tuesday',
    title: 'Treino A — técnica e base',
    focus: ['Peito', 'Costas', 'Pernas'],
    estimatedMinutes: range(55, 65),
    warmup,
    exercises: [
      strength({ userId: 'geovanna', workoutCode: 'A', order: 1, exerciseId: 'goblet-squat-to-bench', repetitions: range(8, 10), restSeconds: 90, targetRir: initialRir, notes: ['Iniciar como sentar e levantar sem carga; adicionar o halter quando estiver pronta.'] }),
      strength({ userId: 'geovanna', workoutCode: 'A', order: 2, exerciseId: 'tander-lat-pulldown', repetitions: range(10, 12), restSeconds: 90, targetRir: initialRir }),
      strength({ userId: 'geovanna', workoutCode: 'A', order: 3, exerciseId: 'tander-pec-deck', repetitions: range(10, 12), restSeconds: 75, targetRir: initialRir }),
      strength({ userId: 'geovanna', workoutCode: 'A', order: 4, exerciseId: 'dumbbell-romanian-deadlift', repetitions: range(8, 10), restSeconds: 90, targetRir: initialRir, notes: ['Usar halteres leves e interromper a amplitude antes de qualquer alteração da coluna.'] }),
      strength({ userId: 'geovanna', workoutCode: 'A', order: 5, exerciseId: 'standing-calf-raise', repetitions: range(10, 15), restSeconds: 60, targetRir: initialRir, notes: ['Começar com peso corporal e apoio para equilíbrio.'] }),
      cardio({ userId: 'geovanna', workoutCode: 'A', order: 6, modality: 'bike', durationMinutes: range(10, 15), targetRpe: range(3), notes: ['Realizar após a musculação.', 'Usar resistência leve que permita pedalar sem queimação precoce nas pernas.'] }),
    ],
  },
  {
    id: 'geovanna-workout-b',
    userId: 'geovanna',
    code: 'B',
    weekday: 'thursday',
    title: 'Treino B — membros superiores',
    focus: ['Peito', 'Costas', 'Ombros', 'Braços'],
    estimatedMinutes: range(55, 70),
    warmup,
    exercises: [
      strength({ userId: 'geovanna', workoutCode: 'B', order: 1, exerciseId: 'dumbbell-chest-press', repetitions: range(8, 10), restSeconds: 90, targetRir: initialRir }),
      strength({ userId: 'geovanna', workoutCode: 'B', order: 2, exerciseId: 'single-arm-dumbbell-row', repetitions: range(10, 12), restSeconds: 75, targetRir: initialRir, notes: ['Executar duas séries de cada lado.'] }),
      strength({ userId: 'geovanna', workoutCode: 'B', order: 3, exerciseId: 'dumbbell-lateral-raise', repetitions: range(12, 15), restSeconds: 60, targetRir: initialRir, notes: ['Usar halteres leves.'] }),
      strength({ userId: 'geovanna', workoutCode: 'B', order: 4, exerciseId: 'seated-dumbbell-curl', repetitions: range(10, 12), restSeconds: 60, targetRir: initialRir }),
      strength({ userId: 'geovanna', workoutCode: 'B', order: 5, exerciseId: 'overhead-dumbbell-triceps-extension', repetitions: range(10, 12), restSeconds: 60, targetRir: initialRir }),
      cardio({ userId: 'geovanna', workoutCode: 'B', order: 6, modality: 'bike', durationMinutes: range(12, 18), targetRpe: range(3, 4), notes: ['Realizar após a musculação.', 'Aumentar primeiro a duração e somente depois a resistência.'] }),
    ],
  },
  {
    id: 'geovanna-workout-c',
    userId: 'geovanna',
    code: 'C',
    weekday: 'friday',
    title: 'Treino C — pernas, core e cardio',
    focus: ['Quadríceps', 'Posteriores', 'Glúteos', 'Core'],
    estimatedMinutes: range(55, 70),
    warmup,
    exercises: [
      strength({ userId: 'geovanna', workoutCode: 'C', order: 1, exerciseId: 'goblet-squat-to-bench', repetitions: range(8, 10), restSeconds: 90, targetRir: initialRir, notes: ['Iniciar como sentar e levantar sem carga; adicionar o halter quando estiver pronta.'] }),
      strength({ userId: 'geovanna', workoutCode: 'C', order: 2, exerciseId: 'tander-leg-extension', repetitions: range(10, 12), restSeconds: 75, targetRir: initialRir }),
      strength({ userId: 'geovanna', workoutCode: 'C', order: 3, exerciseId: 'dumbbell-romanian-deadlift', repetitions: range(8, 10), restSeconds: 90, targetRir: initialRir, notes: ['Usar halteres leves.'] }),
      strength({ userId: 'geovanna', workoutCode: 'C', order: 4, exerciseId: 'standing-calf-raise', repetitions: range(10, 15), restSeconds: 60, targetRir: initialRir, notes: ['Começar com peso corporal e apoio.'] }),
      carry({ userId: 'geovanna', workoutCode: 'C', order: 5, durationSeconds: range(15, 20), targetRpe: range(5, 6) }),
      cardio({ userId: 'geovanna', workoutCode: 'C', order: 6, modality: 'bike', durationMinutes: range(15, 20), targetRpe: range(3, 4), notes: ['Realizar após a musculação.', 'A bicicleta é priorizada inicialmente por reduzir impacto articular.'] }),
    ],
  },
];

export const geovannaWorkoutPlan: WorkoutPlan = {
  id: 'geovanna-initial-plan',
  userId: 'geovanna',
  name: 'Programa inicial — emagrecimento e saúde',
  objective: 'Emagrecimento, saúde e condicionamento, com musculação para preservar massa muscular e melhorar capacidade funcional.',
  templates,
  phases: [...adaptationPhases],
  progressionNotes: [
    ...sharedProgressionNotes,
    'Nas semanas 5–8, manter duas séries e priorizar duração do cardio e qualidade técnica.',
    'Uma terceira série só entra posteriormente se a recuperação estiver boa, sem dor articular relevante e sem fadiga excessiva.',
  ],
  safetyNotes: [...sharedSafetyNotes],
};
