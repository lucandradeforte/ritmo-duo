import type { UserProfile } from '@/types';

export const geovanna: UserProfile = {
  id: 'geovanna',
  name: 'Geovanna',
  age: 25,
  heightCm: 161,
  weightKg: 118,
  primaryGoal: 'weight-loss',
  secondaryGoals: ['health'],
  experience: 'returning-beginner',
  activityLevel: 'sedentary',
  preferredCardio: 'bike',
  trainingDays: ['tuesday', 'thursday', 'friday'],
  maxSessionMinutes: 90,
  healthNotes: [
    'Sem restrição médica conhecida informada.',
    'Retorno após mais de um ano sem musculação.',
    'Bicicleta priorizada inicialmente por oferecer cardio de menor impacto.',
    'Usar a multiestação Tander uma pessoa por vez e interromper se houver instabilidade.',
  ],
};
