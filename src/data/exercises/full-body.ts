import type { Exercise } from '@/types';

export const fullBodyExercises: readonly Exercise[] = [
  {
    id: 'farmer-carry',
    name: 'Caminhada do fazendeiro',
    englishName: 'Farmer carry',
    categories: ['full-body', 'core', 'glutes', 'calves'],
    equipmentTypes: ['dumbbell'],
    equipmentLabel: 'Dois halteres e um percurso curto, plano e livre',
    muscles: {
      primary: ['Core', 'Pegada', 'Trapézio'],
      secondary: ['Glúteos', 'Panturrilhas', 'Estabilizadores dos ombros'],
    },
    instructions: {
      configuration: [
        'Escolha um percurso curto, plano e totalmente livre de obstáculos.',
        'Posicione os halteres ao lado do corpo e levante-os com uma dobradiça de quadril controlada.',
        'Fique em postura alta, com ombros organizados e braços ao lado do corpo.',
      ],
      execution: [
        'Caminhe devagar com passos naturais e tronco alinhado.',
        'Respire continuamente, sem prender o ar.',
        'Faça a volta com passos curtos e controle.',
        'Encerre antes que a pegada ou a postura se deteriore e guarde os halteres com controle.',
      ],
      technicalPoints: [
        'Mantenha o abdômen ativo e evite inclinar para um lado.',
        'Mantenha os ombros afastados das orelhas.',
        'A prioridade é estabilidade, não velocidade.',
      ],
      commonMistakes: [
        'Prender a respiração.',
        'Elevar os ombros.',
        'Dar passos apressados.',
        'Inclinar o tronco.',
        'Usar carga excessiva.',
      ],
      expectedSensation: 'Abdômen estabilizando, esforço nas mãos e na parte superior das costas.',
      stopSignals: ['Dor lombar.', 'Tontura.', 'Perda de equilíbrio ou de controle dos halteres.'],
      alternatives: {
        easier: 'Segurar os halteres parado por 15 segundos em postura estável.',
        standard: 'Caminhar por 20 a 30 segundos.',
        progression: 'Aumentar o tempo antes de aumentar a carga.',
      },
    },
    media: {
      label: "ACE — Farmer's Carry",
      url: 'https://www.acefitness.org/resources/everyone/exercise-library/359/farmer-s-carry/',
      kind: 'article',
      external: true,
      offlineMessage: 'Demonstração externa indisponível offline. As instruções textuais continuam disponíveis.',
    },
  },
];
