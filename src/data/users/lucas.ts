import type { UserProfile } from '@/types';

export const lucas: UserProfile = {
  id: 'lucas',
  name: 'Lucas',
  age: 24,
  heightCm: 183,
  weightKg: 110,
  primaryGoal: 'weight-loss',
  secondaryGoals: ['muscle-gain'],
  experience: 'returning-beginner',
  activityLevel: 'sedentary',
  preferredCardio: 'treadmill',
  trainingDays: ['tuesday', 'thursday', 'friday'],
  maxSessionMinutes: 90,
  healthNotes: [
    'Sem restrição médica conhecida informada.',
    'Retorno após mais de um ano sem musculação.',
    'Usar a multiestação Tander uma pessoa por vez e interromper se houver instabilidade.',
  ],
};
