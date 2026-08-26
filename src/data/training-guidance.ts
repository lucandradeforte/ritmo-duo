import type { TrainingGuidance } from '@/types';

export const trainingGuidance: TrainingGuidance = {
  effortScale: [
    {
      rir: 4,
      approximateRpe: 6,
      description: 'Termine a série acreditando que ainda conseguiria cerca de quatro repetições corretas.',
    },
    {
      rir: 3,
      approximateRpe: 7,
      description: 'Termine a série acreditando que ainda conseguiria cerca de três repetições corretas.',
    },
    {
      rir: 2,
      approximateRpe: 8,
      description: 'Termine a série acreditando que ainda conseguiria cerca de duas repetições corretas.',
    },
  ],
  initialLoadProtocol: [
    'Faça uma série preparatória bem leve de oito repetições.',
    'Escolha uma carga conservadora e execute de oito a dez repetições.',
    'Avalie quantas repetições tecnicamente corretas ainda seriam possíveis.',
    'Se ainda seriam possíveis quatro ou cinco repetições, aumente levemente na próxima tentativa.',
    'Se a técnica piorar antes de oito repetições, reduza a carga.',
    'A carga inicial correta permite completar a faixa prescrita com RIR 3–4.',
    'Não realizar teste de 1RM nesta fase.',
  ],
  duoTraining: [
    'Uma pessoa usa a Tander enquanto a outra executa o exercício com halteres ou banco.',
    'Na Tander, alternem as séries e troquem apenas o pino de carga entre Lucas e Geovanna.',
    'O descanso de uma pessoa pode coincidir com a série da outra.',
    'Não usem dois módulos da multiestação ao mesmo tempo.',
    'Escolham pares diferentes de halteres quando possível para reduzir espera.',
    'Não transformem a alternância em circuito apressado; cada pessoa preserva seu descanso e sua técnica.',
  ],
  cardio: {
    lucas: [
      'Priorizar caminhada na esteira após a musculação.',
      'Se a velocidade exibida for km/h, 5 km/h pode servir apenas como referência inicial confortável.',
      'Não usar velocidade 8 nas primeiras quatro semanas; corrida não é necessária para emagrecer.',
      'Usar RPE cardiovascular 3–4 e Talk Test com frases completas.',
    ],
    geovanna: [
      'Priorizar a bicicleta Evolution Fitness B-302 após a musculação para reduzir impacto articular.',
      'Escolher resistência que permita pedalar continuamente sem fadiga precoce nas pernas.',
      'Usar RPE cardiovascular 3–4 e Talk Test com frases completas.',
      'Aumentar primeiro a duração; somente depois aumentar a resistência.',
    ],
  },
  loadProgression: {
    dumbbells: 'Use o menor par acima disponível. Se o salto for grande, consolide repetições e uma descida de dois segundos antes de subir.',
    barbell: 'Aumente 1–2 kg totais em membros superiores e 2–5 kg totais em agachamento ou terra romeno, apenas se houver anilhas adequadas.',
    multiStation: 'Suba uma posição do pino. Se o incremento for grande, alcance o topo da faixa em todas as séries com RIR 2–3 antes da troca.',
    cardio: 'Acrescente dois a três minutos por sessão e não aumente duração e intensidade simultaneamente.',
  },
};
