import type { Exercise } from '@/types';

const offlineMessage = 'Demonstração externa indisponível offline. As instruções textuais continuam disponíveis.';

export const lowerBodyExercises: readonly Exercise[] = [
  {
    id: 'goblet-squat-to-bench',
    name: 'Agachamento goblet para banco',
    englishName: 'Goblet squat to bench',
    categories: ['quadriceps', 'glutes', 'core'],
    equipmentTypes: ['dumbbell', 'bench', 'bodyweight'],
    equipmentLabel: 'Banco reto e um halter (opção inicial sem carga)',
    muscles: {
      primary: ['Quadríceps', 'Glúteos'],
      secondary: ['Posteriores de coxa', 'Core', 'Panturrilhas'],
    },
    instructions: {
      configuration: [
        'Posicione o banco atrás do corpo e confirme que ele não desliza.',
        'Mantenha os pés em uma largura confortável, aproximadamente à largura dos ombros, com as pontas levemente voltadas para fora.',
        'Segure o halter verticalmente junto ao peito. Na versão mais fácil, execute sem carga.',
      ],
      execution: [
        'Inspire, leve o quadril para trás e dobre os joelhos na mesma direção dos pés.',
        'Desça com controle até tocar o banco, sem despencar ou relaxar sobre ele.',
        'Empurre o chão com o meio do pé e o calcanhar para levantar.',
        'Expire durante a subida e termine em pé, sem hiperestender a lombar.',
      ],
      technicalPoints: [
        'Mantenha a coluna neutra e o peito organizado.',
        'Evite que os joelhos colapsem para dentro.',
        'Não é necessário buscar uma amplitude profunda nesta fase.',
        'Use uma descida controlada.',
      ],
      commonMistakes: [
        'Deixar os joelhos caírem para dentro.',
        'Despencar ou descansar completamente no banco.',
        'Tirar os calcanhares do chão.',
        'Arredondar ou hiperestender a lombar.',
        'Usar impulso para levantar.',
      ],
      expectedSensation: 'Esforço principalmente nas coxas e nos glúteos; aumento moderado da respiração é esperado.',
      stopSignals: [
        'Dor aguda ou articular no joelho.',
        'Dor no quadril ou na lombar.',
        'Tontura ou perda de equilíbrio.',
      ],
      alternatives: {
        easier: 'Sentar e levantar do banco sem carga, usando as mãos apenas se necessário.',
        standard: 'Agachamento goblet tocando o banco com controle.',
        progression: 'Aumentar o halter ou reduzir gradualmente a altura de toque, sem perder a técnica.',
      },
    },
    media: {
      label: 'ACE — Goblet Squat',
      url: 'https://www.acefitness.org/resources/everyone/exercise-library/362/goblet-squat/',
      kind: 'article',
      external: true,
      offlineMessage,
    },
  },
  {
    id: 'dumbbell-romanian-deadlift',
    name: 'Levantamento terra romeno com halteres',
    englishName: 'Dumbbell Romanian deadlift',
    categories: ['hamstrings', 'glutes', 'core'],
    equipmentTypes: ['dumbbell'],
    equipmentLabel: 'Dois halteres',
    muscles: {
      primary: ['Posteriores de coxa', 'Glúteos'],
      secondary: ['Eretores da coluna', 'Abdômen'],
    },
    instructions: {
      configuration: [
        'Fique em pé com um halter em cada mão, à frente das coxas.',
        'Mantenha os pés firmes e os joelhos levemente flexionados.',
        'Organize a coluna em posição neutra e mantenha os halteres próximos ao corpo.',
      ],
      execution: [
        'Inspire e empurre o quadril para trás, como se fechasse uma porta com o quadril.',
        'Desça os halteres próximos às pernas até sentir alongamento nos posteriores, sem arredondar a lombar.',
        'Empurre o chão e leve o quadril para frente até retornar à posição ereta.',
        'Expire durante a subida, sem projetar o quadril além da posição neutra.',
      ],
      technicalPoints: [
        'O movimento é uma dobradiça de quadril, não um agachamento.',
        'Mantenha a coluna longa e o pescoço alinhado.',
        'A amplitude termina quando a mobilidade individual começa a alterar a posição da coluna.',
      ],
      commonMistakes: [
        'Dobrar excessivamente os joelhos.',
        'Arredondar a lombar.',
        'Olhar para frente e estender o pescoço durante a descida.',
        'Descer além da mobilidade disponível.',
        'Afastar os halteres das pernas.',
      ],
      expectedSensation: 'Alongamento e esforço na parte de trás das coxas e nos glúteos, sem dor lombar.',
      stopSignals: [
        'Dor lombar aguda.',
        'Formigamento ou dor irradiada.',
        'Perda de controle da coluna.',
      ],
      alternatives: {
        easier: 'Aprender a dobradiça de quadril sem carga, tocando o quadril em uma parede.',
        standard: 'Executar com dois halteres leves.',
        progression: 'Aumentar gradualmente os halteres antes de considerar a barra.',
      },
    },
    media: {
      label: 'ACE — Romanian Deadlift',
      url: 'https://www.acefitness.org/continuing-education/prosource/january-2016/5767/ace-technique-series-romanian-deadlift/',
      kind: 'article',
      external: true,
      offlineMessage,
    },
  },
  {
    id: 'tander-leg-extension',
    name: 'Extensão de joelhos',
    englishName: 'Leg extension',
    categories: ['quadriceps'],
    equipmentTypes: ['multi-station'],
    equipmentLabel: 'Multiestação Tander TMEDM — módulo frontal de extensão de pernas',
    muscles: {
      primary: ['Quadríceps'],
      secondary: [],
    },
    instructions: {
      configuration: [
        'Use apenas se o módulo estiver montado, íntegro e estável.',
        'Ajuste o rolo acolchoado logo acima dos tornozelos.',
        'Encoste quadril e costas no assento e alinhe o joelho ao eixo de giro da máquina.',
      ],
      execution: [
        'Inspire na posição inicial com os joelhos flexionados confortavelmente.',
        'Estenda os joelhos com controle até quase retos, sem travá-los agressivamente.',
        'Faça uma pausa curta no topo e expire.',
        'Retorne devagar, sem deixar a torre de pesos bater.',
      ],
      technicalPoints: [
        'Mantenha o quadril apoiado durante toda a série.',
        'Deixe tornozelos e pés neutros.',
        'Comece com carga leve e amplitude confortável.',
      ],
      commonMistakes: [
        'Chutar rapidamente o rolo.',
        'Deixar os pesos baterem.',
        'Hiperestender os joelhos.',
        'Levantar o quadril do assento.',
        'Usar carga alta demais.',
      ],
      expectedSensation: 'Esforço localizado na parte da frente das coxas.',
      stopSignals: [
        'Dor aguda dentro ou ao redor do joelho.',
        'Instabilidade da máquina, do cabo ou do rolo.',
      ],
      alternatives: {
        easier: 'Sentar e levantar do banco com controle.',
        standard: 'Extensão de joelhos na Tander com carga leve.',
        progression: 'Atingir o topo da faixa de repetições antes de subir uma posição da torre.',
      },
    },
    media: {
      label: 'ACE — Seated Leg Extension',
      url: 'https://www.acefitness.org/resources/everyone/exercise-library/183/seated-leg-extension/',
      kind: 'article',
      external: true,
      offlineMessage,
    },
  },
  {
    id: 'standing-calf-raise',
    name: 'Elevação de panturrilha em pé',
    englishName: 'Standing calf raise',
    categories: ['calves'],
    equipmentTypes: ['bodyweight', 'dumbbell', 'bench'],
    equipmentLabel: 'Peso corporal; banco ou parede para apoio; halteres apenas após dominar a versão básica',
    muscles: {
      primary: ['Gastrocnêmio', 'Sóleo'],
      secondary: ['Músculos estabilizadores do tornozelo'],
    },
    instructions: {
      configuration: [
        'Fique próximo ao banco ou a uma parede para apoio leve.',
        'Distribua o peso igualmente entre os dois pés.',
        'Mantenha pés paralelos e joelhos destravados, sem agachar.',
      ],
      execution: [
        'Eleve os calcanhares e suba na ponta dos pés de forma controlada.',
        'Faça uma pausa curta no topo.',
        'Desça os calcanhares devagar até a posição inicial.',
        'Respire continuamente durante o movimento.',
      ],
      technicalPoints: [
        'Mantenha os tornozelos alinhados, sem cair para dentro ou para fora.',
        'Use o apoio apenas para equilíbrio, não para puxar o corpo.',
      ],
      commonMistakes: [
        'Quicar em vez de controlar o movimento.',
        'Dobrar excessivamente os joelhos.',
        'Deixar os tornozelos caírem para dentro.',
        'Puxar o corpo com o apoio.',
      ],
      expectedSensation: 'Contração e fadiga progressiva nas panturrilhas.',
      stopSignals: [
        'Dor no tendão de Aquiles.',
        'Dor no tornozelo ou na planta do pé.',
        'Perda de equilíbrio.',
      ],
      alternatives: {
        easier: 'Executar com as duas mãos apoiadas e amplitude confortável.',
        standard: 'Elevação bilateral usando apenas o peso corporal.',
        progression: 'Adicionar uma pausa de dois segundos no topo ou segurar halteres.',
      },
    },
    media: {
      label: 'ACE — Exercícios para panturrilhas',
      url: 'https://www.acefitness.org/resources/everyone/exercise-library/body-part/legs-calves-and-shins/',
      kind: 'article',
      external: true,
      offlineMessage,
    },
  },
];
