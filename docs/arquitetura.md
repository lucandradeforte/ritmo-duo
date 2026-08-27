# Arquitetura do Ritmo Duo

Este documento é o mapa técnico da aplicação. Ele complementa o README e orienta mudanças futuras sem duplicar a prescrição de treino nos componentes.

## Visão geral

O Ritmo Duo é uma PWA mobile-first, inteiramente client-side, para registrar treinos individuais de Lucas e Geovanna. Não há backend, autenticação, telemetria, sincronização em nuvem ou chamadas remotas para dados de treino.

| Área | Decisão atual |
| --- | --- |
| Interface | React 19, TypeScript estrito, CSS Modules e tokens globais. |
| Build | Vite 8. |
| Navegação | React Router 7 com HashRouter para compatibilidade com GitHub Pages. |
| Persistência | IndexedDB, encapsulado por APIs em **src/storage**. |
| PWA | vite-plugin-pwa, Workbox e workbox-window. |
| Ícones | Lucide React. |
| Testes | Vitest, Testing Library, JSDOM e fake-indexeddb. |
| Publicação | GitHub Actions para GitHub Pages. |

## Fluxo de execução

~~~text
src/main.tsx
  └─ App
      └─ HashRouter
          └─ AppController
              ├─ carrega IndexedDB e preferências
              ├─ mantém estado de UI em memória
              ├─ monta rotas, modais e feedbacks globais
              ├─ persiste treino ativo em fila serializada
              ├─ coordena conclusão atômica e recuperação
              └─ conecta PWA, tema, Wake Lock e conectividade
~~~

**src/app/App.tsx** é o composition root. Ele não concentra regras de cálculo: delega criação de sessão, fase, timer, progressão e volume para **src/utils**, e delega leitura/escrita para **src/storage**.

As telas secundárias são carregadas sob demanda com lazy e Suspense. A tela Hoje e o treino ativo são carregados diretamente por serem os caminhos críticos.

## Estrutura do repositório

~~~text
src/
├── app/                    shell, rotas e orquestração
├── components/
│   ├── brand/              marca
│   ├── feedback/           estado vazio e conectividade
│   ├── navigation/         navegação inferior
│   └── ui/                 botões, superfícies, modais e seletor de perfil
├── data/
│   ├── exercises/          catálogo de exercícios
│   ├── users/              Lucas e Geovanna
│   ├── workout-plans/      fichas A, B e C e regras compartilhadas
│   └── exercise-demonstrations.ts
├── features/
│   ├── active-workout/     sessão, séries, cardio, descanso e conclusão
│   ├── exercises/          detalhe e mídia de execução
│   ├── history/            lista e detalhe de sessões
│   ├── progress/           métricas por perfil
│   ├── settings/           perfil, preferências e backup
│   ├── users/              seleção de perfil
│   └── workouts/           hoje, fichas e detalhe de ficha
├── hooks/                  hooks de interface reutilizáveis
├── pwa/                    instalação, atualização, conectividade e feedback
├── storage/                IndexedDB, migrations, backup e APIs por agregado
├── styles/                 tokens e estilos globais
├── test/                   setup de testes
├── types/                  contratos de domínio, sessão e storage
└── utils/                  regras puras, cálculos e helpers

public/
├── exercise-media/         animação e poster WebP para cada exercício
└── ícones PWA e iOS

scripts/
├── generate-icons.mjs
└── exercise-media-assets.test.ts
~~~

## Rotas e telas

| Rota | Tela | Responsabilidade |
| --- | --- | --- |
| **#/today** | Hoje | Sugestão de sessão, resumo semanal e retomada. |
| **#/workouts** | Treinos | Fichas A, B e C do perfil atual. |
| **#/history** | Histórico | Sessões concluídas do perfil atual. |
| **#/progress** | Progresso | Métricas e cargas por perfil. |
| **#/profile** | Perfil | Preferências, guia, backup e troca de usuário. |
| **#/active** | Treino ativo | Registro de sessão sem navegação inferior. |

Rotas desconhecidas redirecionam para Hoje. Sem perfil selecionado, o app exibe somente a seleção de Lucas ou Geovanna e os avisos PWA.

## Camada de domínio

Os contratos principais vivem em **src/types/domain.ts** e **src/types/session.ts**.

| Contrato | Onde é definido | Papel |
| --- | --- | --- |
| UserProfile | domain | Perfil fixo, objetivos, cardio preferido e agenda. |
| Exercise | domain | Catálogo, equipamentos, instruções, alternativas e mídia. |
| WorkoutPlan e WorkoutTemplate | domain | Planos e fichas A/B/C por pessoa. |
| StrengthPrescription, CarryPrescription e CardioPrescription | domain | Prescrições discriminadas por tipo. |
| WorkoutSession | session | Registro histórico de uma pessoa. |
| ActiveWorkoutState | session | Sessão ativa solo ou dupla, com participantes e descanso. |
| SetSession e CardioSession | session | Dados registrados durante a sessão. |
| ExerciseProgressRecord | session | Última e melhor carga/volume por exercício e pessoa. |

### Dados estáticos

- **src/data/users** contém os perfis.
- **src/data/exercises** contém os 12 exercícios e suas instruções.
- **src/data/exercise-demonstrations.ts** associa mídia local tipada.
- **src/data/workout-plans** concentra fichas, aquecimentos, fases, progressão e segurança.
- **src/data/training-guidance.ts** contém orientação estruturada adicional; não é a fonte de UI principal hoje.

A prescrição não deve ser duplicada em componentes. Uma mudança de ficha deve ser feita na camada de dados e coberta por testes de catálogo ou regra.

## Regras puras

| Módulo | Responsabilidade |
| --- | --- |
| **utils/session.ts** | Cria sessões, séries, cardio, treino solo/dupla e troca de participante. |
| **utils/training-phase.ts** | Ajusta RIR e meta de cardio pela semana efetiva. |
| **utils/program-week.ts** | Calcula semana a partir de sessões concluídas e reinicia após inatividade. |
| **utils/progression.ts** | Avalia progressão dupla sem alterar carga automaticamente. |
| **utils/timer.ts** | Cria e calcula timers por timestamp. |
| **utils/volume.ts** | Calcula volume e estatísticas de sessão. |
| **utils/workout-completion.ts** | Determina pendências de participantes no modo dupla. |
| **utils/public-asset.ts** | Resolve assets públicos com o base path do Vite. |

As funções em **utils** devem permanecer previsíveis e sem acesso a DOM, storage ou rede. Cada regra relevante deve ter teste unitário correspondente.

## Sessão ativa e conclusão

O fluxo crítico é:

~~~text
Ação na tela
  → callback em AppController
  → função pura cria novo estado
  → persistActive enfileira saveActiveWorkout
  → IndexedDB

Salvar e concluir
  → feedback de cada participante
  → completeActiveWorkout em uma transação
  → grava histórico e progresso
  → remove treino ativo
~~~

### Solo e dupla

- Há apenas um treino ativo persistido por aparelho.
- No modo dupla, cada participante recebe uma WorkoutSession independente.
- Os históricos, fases, cardio e progressos permanecem separados por userId.
- O estado possui apenas um restTimer. Não prometer timers independentes por participante.
- Após a primeira conclusão em dupla, o app troca para a pessoa pendente.
- A transação final só é permitida quando todos os participantes concluíram o cardio e salvaram o feedback final, ainda que o conteúdo do feedback seja opcional.

### Timers e persistência

O descanso e a duração usam horários de início, não contadores incrementais. Ao voltar de background, o tempo é recalculado por Data atual menos timestamp inicial.

O AppController mantém uma fila de escrita para preservar a ordem das alterações do treino ativo. Erros de persistência são expostos visualmente com opção de nova tentativa; não descarte estado em memória como forma de recuperar um erro.

## Persistência local

O banco IndexedDB chama-se **ritmo-duo** e está na versão definida em **src/storage/migrations.ts**.

| Store | Chave ou índices | Conteúdo |
| --- | --- | --- |
| metadata | chave | versão do storage. |
| users | id | perfis. |
| preferences | app | tema, último perfil, som, Wake Lock e ajuda de instalação. |
| workoutSessions | id; by-user, by-status, by-started-at | histórico. |
| activeWorkout | current | único treino ativo. |
| exerciseProgress | id; by-user, by-exercise | última/melhor carga e volume. |

**src/storage/database.ts** abre o banco e semeia perfis/preferências. **src/storage/backup.ts** exporta, valida e importa backup. A importação substitui todos os stores de usuário, preferências, sessões, sessão ativa e progresso após validação estrutural.

Qualquer mudança de schema exige:

1. Incrementar a versão de storage.
2. Implementar uma migração compatível em **migrations.ts**.
3. Atualizar a validação do backup.
4. Cobrir migração, backup e recuperação nos testes.

Componentes e features não devem acessar IndexedDB ou localStorage diretamente.

## PWA, mídia e GitHub Pages

**vite.config.ts** calcula o base path a partir do repositório durante o GitHub Actions. Esse comportamento é necessário para que o app funcione em subpastas do GitHub Pages.

| Área | Regra |
| --- | --- |
| Navegação | Manter HashRouter para atualização de rota sem erro 404 no Pages. |
| Assets públicos | Usar resolvePublicAssetPath para recursos carregados em runtime. |
| Mídia | Cada demonstração usa um par de animação e poster WebP em public/exercise-media. |
| Cache | Workbox precacheia WebP, HTML, CSS, JS, SVG, PNG, ICO, WOFF2 e JSON. |
| Atualização | O service worker usa atualização orientada por confirmação e não atualiza durante treino ativo. |
| Instalação Android | O prompt nativo é ocultado no Samsung Internet, cujo APK gerado pode ser bloqueado pelo Play Protect; o app orienta a instalação pelo Chrome. |
| Recursos opcionais | Áudio, vibração e Wake Lock usam feature detection e fallback visual. |

O teste em **scripts/exercise-media-assets.test.ts** confirma que todos os WebP declarados existem e têm assinatura válida. Ao incluir uma nova demonstração, registre o catálogo tipado, os dois arquivos e o teste de integridade.

## Interface, acessibilidade e responsividade

O design usa CSS Modules nos componentes e tokens em **src/styles/global.css**. Evite adicionar uma segunda estratégia de estilos ou CSS global para comportamento local.

Requisitos funcionais de interface:

- prioridade para telas entre 360 e 430 CSS px;
- safe areas em cabeçalho, navegação, modais e ações fixas;
- unidades dinâmicas de viewport com fallback;
- alvos de toque de pelo menos 44 px nas ações principais;
- campos numéricos com inputmode adequado e fonte mínima de 16 px;
- sem dependência de hover ou swipe;
- suporte a tema claro, escuro e do sistema;
- respeito a prefers-reduced-motion;
- modais com foco, Escape, trap de Tab e retorno de foco;
- mensagens de estado com semântica acessível.

## Testes e qualidade

O projeto tem cobertura para regras de dados, sessão, fase, progressão, timer, volume, persistência, backup, PWA, mídia e fluxos principais de interface.

Os gates obrigatórios são:

~~~bash
pnpm run lint
pnpm run test
GITHUB_ACTIONS=true GITHUB_REPOSITORY=lucandradeforte/ritmo-duo pnpm run build
git diff --check
~~~

Mudanças visuais, PWA ou de fluxo ativo também pedem revisão manual nas larguras 360, 375, 390, 412 e 430 px, em tema claro/escuro, com offline, recuperação de sessão e modo dupla. Alterações relevantes de PWA devem ser verificadas em iPhone/Safari, Galaxy/Chrome para instalação e Galaxy/Samsung Internet para a orientação de instalação e uso no navegador.

## Invariantes do produto

1. O produto é offline-first e client-side; não introduza backend, login, sincronização ou analytics sem pedido explícito.
2. Nunca misture dados de Lucas e Geovanna.
3. Mantenha somente um treino ativo por aparelho.
4. Persista imediatamente e em ordem as mudanças de treino ativo.
5. Use timestamps como verdade para descanso, cardio e duração.
6. Conclua histórico, progresso e remoção do treino ativo em uma transação.
7. Não altere carga automaticamente a partir da progressão sugerida.
8. Mudanças de prescrição ou conteúdo de saúde exigem autorização explícita e não são diagnóstico.
9. Preserve base path, HashRouter e cache de WebP no GitHub Pages.
10. Não permita que atualização de service worker interrompa uma sessão ativa.

## Skills do projeto

As skills em **skills/** codificam os contextos que mais alteram decisões de implementação:

| Skill | Escopo |
| --- | --- |
| [ritmo-duo-project-context](../skills/ritmo-duo-project-context/SKILL.md) | Contexto transversal, limites e gates. |
| [ritmo-duo-training-domain](../skills/ritmo-duo-training-domain/SKILL.md) | Dados de treino, exercício, fase e progressão. |
| [ritmo-duo-active-workout-storage](../skills/ritmo-duo-active-workout-storage/SKILL.md) | Sessão ativa, timer, IndexedDB, histórico e backup. |
| [ritmo-duo-react-ui](../skills/ritmo-duo-react-ui/SKILL.md) | Rotas, telas, componentes e acessibilidade. |
| [ritmo-duo-mobile-pwa](../skills/ritmo-duo-mobile-pwa/SKILL.md) | PWA, assets, Workbox, Pages e UX mobile. |

Use a skill mais específica junto com a de contexto quando o ambiente de Codex permitir múltiplas skills.
