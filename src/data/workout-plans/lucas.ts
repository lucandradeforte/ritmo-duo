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

const warmup = createWarmup('treadmill');

const templates: WorkoutTemplate[] = [
  {
    id: 'lucas-workout-a',
    userId: 'lucas',
    code: 'A',
    weekday: 'tuesday',
    title: 'Treino A — técnica e base',
    focus: ['Peito', 'Costas', 'Pernas'],
    estimatedMinutes: range(60, 70),
    warmup,
    exercises: [
      strength({ userId: 'lucas', workoutCode: 'A', order: 1, exerciseId: 'goblet-squat-to-bench', repetitions: range(8, 10), restSeconds: 90, targetRir: range(3) }),
      strength({ userId: 'lucas', workoutCode: 'A', order: 2, exerciseId: 'tander-lat-pulldown', repetitions: range(8, 12), restSeconds: 90, targetRir: range(3) }),
      strength({ userId: 'lucas', workoutCode: 'A', order: 3, exerciseId: 'tander-pec-deck', repetitions: range(10, 12), restSeconds: 75, targetRir: range(3) }),
      strength({ userId: 'lucas', workoutCode: 'A', order: 4, exerciseId: 'dumbbell-romanian-deadlift', repetitions: range(8, 10), restSeconds: 90, targetRir: range(3) }),
      strength({ userId: 'lucas', workoutCode: 'A', order: 5, exerciseId: 'standing-calf-raise', repetitions: range(10, 15), restSeconds: 60, targetRir: range(3) }),
      cardio({ userId: 'lucas', workoutCode: 'A', order: 6, modality: 'treadmill', durationMinutes: range(10, 15), targetRpe: range(3, 4), notes: ['Realizar após a musculação.', 'Usar caminhada contínua confortável; não correr nas primeiras quatro semanas.'] }),
    ],
  },
  {
    id: 'lucas-workout-b',
    userId: 'lucas',
    code: 'B',
    weekday: 'thursday',
    title: 'Treino B — membros superiores',
    focus: ['Peito', 'Costas', 'Ombros', 'Braços'],
    estimatedMinutes: range(60, 75),
    warmup,
    exercises: [
      strength({ userId: 'lucas', workoutCode: 'B', order: 1, exerciseId: 'dumbbell-chest-press', repetitions: range(8, 12), restSeconds: 90, targetRir: range(3) }),
      strength({ userId: 'lucas', workoutCode: 'B', order: 2, exerciseId: 'single-arm-dumbbell-row', repetitions: range(10, 12), restSeconds: 75, targetRir: range(3), notes: ['Executar duas séries de cada lado.'] }),
      strength({ userId: 'lucas', workoutCode: 'B', order: 3, exerciseId: 'dumbbell-lateral-raise', repetitions: range(12, 15), restSeconds: 60, targetRir: range(3, 4) }),
      strength({ userId: 'lucas', workoutCode: 'B', order: 4, exerciseId: 'seated-dumbbell-curl', repetitions: range(10, 12), restSeconds: 60, targetRir: range(3) }),
      strength({ userId: 'lucas', workoutCode: 'B', order: 5, exerciseId: 'overhead-dumbbell-triceps-extension', repetitions: range(10, 12), restSeconds: 60, targetRir: range(3) }),
      cardio({ userId: 'lucas', workoutCode: 'B', order: 6, modality: 'treadmill', durationMinutes: range(12, 18), targetRpe: range(3, 4), notes: ['Realizar após a musculação.', 'Caminhada contínua confortável.'] }),
    ],
  },
  {
    id: 'lucas-workout-c',
    userId: 'lucas',
    code: 'C',
    weekday: 'friday',
    title: 'Treino C — pernas, core e cardio',
    focus: ['Quadríceps', 'Posteriores', 'Glúteos', 'Core'],
    estimatedMinutes: range(65, 75),
    warmup,
    exercises: [
      strength({ userId: 'lucas', workoutCode: 'C', order: 1, exerciseId: 'goblet-squat-to-bench', repetitions: range(8, 10), restSeconds: 90, targetRir: range(3) }),
      strength({ userId: 'lucas', workoutCode: 'C', order: 2, exerciseId: 'tander-leg-extension', repetitions: range(10, 12), restSeconds: 75, targetRir: range(3) }),
      strength({ userId: 'lucas', workoutCode: 'C', order: 3, exerciseId: 'dumbbell-romanian-deadlift', repetitions: range(8, 10), restSeconds: 90, targetRir: range(3) }),
      strength({ userId: 'lucas', workoutCode: 'C', order: 4, exerciseId: 'standing-calf-raise', repetitions: range(10, 15), restSeconds: 60, targetRir: range(3) }),
      carry({ userId: 'lucas', workoutCode: 'C', order: 5, durationSeconds: range(20, 30), targetRpe: range(6) }),
      cardio({ userId: 'lucas', workoutCode: 'C', order: 6, modality: 'treadmill', durationMinutes: range(15, 20), targetRpe: range(3, 4), notes: ['Realizar após a musculação.', 'Aumentar primeiro a duração; não elevar duração e intensidade no mesmo treino.'] }),
    ],
  },
];

export const lucasWorkoutPlan: WorkoutPlan = {
  id: 'lucas-initial-plan',
  userId: 'lucas',
  name: 'Programa inicial — emagrecimento e massa muscular',
  objective: 'Emagrecimento com preservação e ganho gradual de massa muscular.',
  templates,
  phases: [...adaptationPhases],
  progressionNotes: [
    ...sharedProgressionNotes,
    'A partir da semana 5, se a recuperação estiver boa, adicionar uma terceira série somente em puxada frontal, crucifixo, supino, remada, agachamento e terra romeno.',
  ],
  safetyNotes: [...sharedSafetyNotes],
};
