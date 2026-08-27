import type { ExerciseDemonstration } from '@/types';

const createDemonstration = (
  exerciseId: string,
  alt: string,
  caption: string,
): ExerciseDemonstration => ({
  kind: 'animated-webp',
  animationPath: `exercise-media/${exerciseId}.webp`,
  posterPath: `exercise-media/${exerciseId}-poster.webp`,
  alt,
  caption,
  width: 480,
  height: 480,
});

export const exerciseDemonstrations: Readonly<Record<string, ExerciseDemonstration>> = {
  'goblet-squat-to-bench': createDemonstration(
    'goblet-squat-to-bench',
    'Sequência animada do agachamento goblet: em pé, descida controlada, toque leve no banco e retorno.',
    'Mantenha o halter junto ao peito, os calcanhares apoiados e os joelhos acompanhando a direção dos pés.',
  ),
  'dumbbell-romanian-deadlift': createDemonstration(
    'dumbbell-romanian-deadlift',
    'Sequência animada do levantamento terra romeno com halteres, mostrando a dobradiça de quadril e o retorno.',
    'Leve o quadril para trás, mantenha a coluna neutra e deixe os halteres próximos às pernas.',
  ),
  'tander-leg-extension': createDemonstration(
    'tander-leg-extension',
    'Sequência animada da extensão de joelhos sentada, da flexão confortável até as pernas quase estendidas.',
    'A máquina ilustrada é genérica; na Tander, alinhe os joelhos ao eixo e posicione o rolo acima dos tornozelos.',
  ),
  'standing-calf-raise': createDemonstration(
    'standing-calf-raise',
    'Sequência animada da elevação de panturrilha em pé com apoio leve para equilíbrio.',
    'Suba e desça os calcanhares sem quicar, mantendo os tornozelos alinhados.',
  ),
  'tander-lat-pulldown': createDemonstration(
    'tander-lat-pulldown',
    'Sequência animada da puxada frontal, com a barra descendo da polia alta até a parte superior do peito.',
    'A máquina ilustrada é genérica; na Tander, puxe sempre pela frente e mantenha o tronco estável.',
  ),
  'tander-pec-deck': createDemonstration(
    'tander-pec-deck',
    'Sequência animada do crucifixo na máquina, fechando os braços em arco à frente do peito.',
    'A máquina ilustrada é genérica; use os braços borboleta da Tander e uma abertura confortável para os ombros.',
  ),
  'dumbbell-chest-press': createDemonstration(
    'dumbbell-chest-press',
    'Sequência animada do supino reto com halteres, mostrando a descida controlada e o empurrar para cima.',
    'Mantenha pés, quadril, costas e cabeça apoiados, com os cotovelos entre 30 e 60 graus do tronco.',
  ),
  'single-arm-dumbbell-row': createDemonstration(
    'single-arm-dumbbell-row',
    'Sequência animada da remada unilateral com mão e joelho apoiados no banco.',
    'Puxe o cotovelo em direção ao quadril sem girar o tronco ou encolher o ombro.',
  ),
  'dumbbell-lateral-raise': createDemonstration(
    'dumbbell-lateral-raise',
    'Sequência animada da elevação lateral com halteres, dos braços ao lado do corpo até a altura dos ombros.',
    'Use halteres leves, mantenha o tronco imóvel e não eleve as mãos além dos ombros.',
  ),
  'seated-dumbbell-curl': createDemonstration(
    'seated-dumbbell-curl',
    'Sequência animada da rosca bíceps sentada com dois halteres.',
    'Mantenha os cotovelos junto ao tronco, os punhos alinhados e evite balanço das costas.',
  ),
  'overhead-dumbbell-triceps-extension': createDemonstration(
    'overhead-dumbbell-triceps-extension',
    'Sequência animada da extensão de tríceps acima da cabeça com um halter segurado pelas duas mãos.',
    'Controle as costelas, mantenha os cotovelos apontados para frente e use uma amplitude confortável.',
  ),
  'farmer-carry': createDemonstration(
    'farmer-carry',
    'Sequência animada da caminhada do fazendeiro com um halter em cada mão e passos curtos.',
    'Caminhe em postura alta, com ombros nivelados, abdômen ativo e os halteres estáveis ao lado do corpo.',
  ),
};
