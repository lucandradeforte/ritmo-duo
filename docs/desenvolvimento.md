# Desenvolvimento e manutenção

Este guia descreve como evoluir o Ritmo Duo sem quebrar o fluxo offline, a separação entre perfis ou a publicação no GitHub Pages.

Para entender a aplicação antes de alterar código, leia primeiro [Arquitetura](arquitetura.md). Para alterações de comportamento, carregue também a skill mais específica em [skills/](../skills/).

## Pré-requisitos

- Node.js 22.22.2 ou mais recente dentro da linha 22.
- pnpm 11.19.0, conforme declarado em **package.json**.
- Um navegador moderno para desenvolvimento local.

Com nvm, execute `nvm use` na raiz do repositório para aplicar automaticamente a versão declarada em **.nvmrc**.

O repositório usa pnpm e possui lockfile. Não troque para npm nem regenere o lockfile sem necessidade explícita.

## Setup local

~~~bash
pnpm install --frozen-lockfile
pnpm run dev
~~~

O Vite informa a URL local no terminal. Para testar em outro dispositivo da mesma rede:

~~~bash
pnpm run dev -- --host
~~~

Service worker e Wake Lock precisam de localhost ou HTTPS para validação confiável.

## Scripts disponíveis

| Comando | Finalidade |
| --- | --- |
| pnpm run dev | Inicia o Vite em desenvolvimento. |
| pnpm run build | Executa TypeScript e gera o build de produção. |
| pnpm run preview | Serve o build localmente. |
| pnpm run lint | Executa ESLint sem warnings. |
| pnpm run test | Executa a suíte Vitest completa. |
| pnpm run test:watch | Mantém o Vitest em modo observação. |
| pnpm run assets | Regenera os ícones v6 a partir de assets/app-icons/app-icon-v6-source.png. |

Para simular o contexto de subpasta do GitHub Pages no build:

~~~bash
GITHUB_ACTIONS=true GITHUB_REPOSITORY=lucandradeforte/ritmo-duo pnpm run build
~~~

## Onde cada mudança pertence

| Necessidade | Local primário | Observações |
| --- | --- | --- |
| Comportamento de uma tela | src/features ou src/app | Mantenha componentes controlados por props e callbacks. |
| Componente reutilizável | src/components | Reutilize Button, Surface, Modal e padrões existentes antes de criar outro. |
| Ficha, perfil, exercício ou orientação | src/data e src/types | Não duplique prescrição em componente. |
| Cálculo ou regra determinística | src/utils | Sem DOM, storage ou efeitos; adicione teste unitário. |
| Persistência | src/storage | Não acesse IndexedDB ou localStorage pela UI. |
| PWA, instalação, cache ou dispositivo | src/pwa, vite.config.ts, index.html ou public | Respeite base path e sessão ativa. |
| Estilo de uma peça | arquivo CSS Module ao lado da peça | Use tokens globais e evite CSS global local. |
| Contrato compartilhado | src/types | Prefira unions discriminadas e tipagem forte. |

## Convenções de arquitetura

- **AppController** em **src/app/App.tsx** orquestra estado global de interface, rotas e modais globais.
- **useAppBootstrap** carrega e atualiza o estado agregado; **useActiveWorkoutController** preserva a fila serializada; **ActiveWorkoutRoute** adapta esse controller à tela controlada.
- **AppErrorBoundary** envolve o router e oferece fallback seguro para falhas de renderização ou imports lazy.
- **features** recebem dados e callbacks; não conhecem IndexedDB diretamente.
- **data** contém os valores de domínio e a prescrição real.
- **utils** contém regras puras e testáveis.
- **storage** encapsula o banco e suas transações.
- **CSS Modules** são o padrão visual; os tokens ficam em **src/styles/global.css**.
- O alias **@/** aponta para **src/**.

Evite Redux, novos contextos globais e bibliotecas grandes sem uma necessidade demonstrada pelo código atual.

## Alterar o domínio de treino

Para mexer em perfis, fichas, exercícios, fases, cardio, RIR/RPE ou progressão:

1. Carregue [ritmo-duo-training-domain](../skills/ritmo-duo-training-domain/SKILL.md).
2. Leia os tipos em **src/types/domain.ts** e **src/types/session.ts**.
3. Localize os dados em **src/data/users**, **src/data/exercises** ou **src/data/workout-plans**.
4. Atualize ou crie testes de dados e regras puras.
5. Revise impacto na tela de treino ativo e no histórico.

Não trate os valores de treino como diagnóstico ou prescrição médica. Mudanças de saúde, equipamentos confirmados ou exercícios exigem autorização explícita.

### Novo exercício ou demonstração

Além dos dados tipados, um exercício com demonstração precisa:

1. Entrar no catálogo de **src/data/exercises**.
2. Ser associado em **src/data/exercise-demonstrations.ts**.
3. Ter o par de arquivos **<id>.webp** e **<id>-poster.webp** em **public/exercise-media**.
4. Usar o helper **resolvePublicAssetPath** por meio do componente existente.
5. Passar o teste de integridade de mídia incluído na suíte.

Não substitua a mídia local por GIFs remotos ou pesados.

## Alterar sessão ativa, storage ou backup

Para mudar série, cardio, modo dupla, timer, histórico, progresso, IndexedDB ou backup:

1. Carregue [ritmo-duo-active-workout-storage](../skills/ritmo-duo-active-workout-storage/SKILL.md).
2. Comece pelos contratos em **src/types/session.ts**.
3. Preserve a fila de escrita de treino ativo em AppController.
4. Preserve timers baseados em timestamps.
5. Mantenha a conclusão de todas as sessões, do progresso e da remoção do treino ativo em transação.
6. Atualize testes com fake-indexeddb.

A ação de apagar histórico deve usar **clearUserWorkoutHistory(userId)**. Ela remove sessões e progresso daquele perfil em uma única transação e não inclui pesagens, perfis, preferências ou treino ativo.

### Evoluir o schema

Uma mudança de formato persistido exige todos os itens abaixo:

1. Incrementar STORAGE_VERSION em **src/storage/migrations.ts**.
2. Criar uma migração que suporte bancos existentes.
3. Atualizar **src/storage/schema.ts** e APIs de storage.
4. Atualizar validação e serialização do backup em **src/storage/backup.ts**.
5. Cobrir migração, importação e recuperação de sessão nos testes.

Importação de backup é substitutiva. A interface deve pedir confirmação antes de iniciar esse fluxo, e a validação deve acontecer antes da limpeza dos stores.

## Alterar UI e acessibilidade

Para telas, navegação, componentes e CSS:

1. Carregue [ritmo-duo-react-ui](../skills/ritmo-duo-react-ui/SKILL.md).
2. Procure uma peça visual semelhante em **src/components** e **src/features**.
3. Use CSS Modules e tokens já existentes.
4. Preserve labels, foco, teclado, estados de loading/erro/vazio e semântica de diálogo.
5. Evite estado derivado e efeitos desnecessários.

O público prioritário usa telas estreitas. Campos numéricos devem manter inputmode apropriado e fonte de pelo menos 16 px para evitar zoom do Safari.

## Alterar PWA, cache ou layout mobile

Para assets públicos, manifest, service worker, GitHub Pages, Wake Lock, vibração, áudio, safe area ou comportamento offline:

1. Carregue [ritmo-duo-mobile-pwa](../skills/ritmo-duo-mobile-pwa/SKILL.md).
2. Revise **vite.config.ts**, **index.html**, **src/pwa** e o componente afetado.
3. Teste a build com variáveis de GitHub Pages.
4. Valide offline depois de visitar o app com conexão.
5. Garanta que atualização de service worker não recarregue o app durante treino ativo.

Assets carregados em runtime devem respeitar import.meta.env.BASE_URL. Não use caminhos absolutos que funcionem apenas na raiz do domínio.

## Testes

Ao mudar comportamento, comece com o teste mais próximo:

| Área | Testes existentes úteis |
| --- | --- |
| Dados e catálogo | src/data/data.test.ts e scripts/exercise-media-assets.test.ts |
| Sessão, fase e progressão | src/utils/*.test.ts |
| Storage e backup | src/storage/storage.test.ts |
| Fluxo de interface | src/app/App.test.tsx e testes de features |
| PWA | src/pwa/*.test.ts |

Os relógios do treino ativo devem ser testados com timers falsos e continuar derivados de timestamps. Evite colocar ticks frequentes no **AppController** ou usar contador incremental como fonte de verdade.

### Testes E2E

O projeto usa Playwright com Chromium em dois perfis: desktop e mobile. O runner inicia o Vite localmente, mantém o base path raiz para o ambiente de teste e executa o smoke de selecionar perfil e iniciar um treino.

```bash
pnpm exec playwright install chromium
pnpm run test:e2e
```

Em uma máquina Linux recém-configurada, instale também as bibliotecas exigidas pelo Chromium uma única vez:

```bash
pnpm exec playwright install-deps chromium
```

O comando solicita a senha de sudo no terminal. O Chromium é baixado uma única vez para o cache local. No CI, o job **Testes E2E** instala o navegador e suas dependências de sistema antes de executar a mesma suíte. Modal de exercício, pesagem, troca de perfil e retomada após recarregar são os próximos fluxos prioritários.

Os E2E exercitam a aplicação sem registrar service worker: o Playwright define `RITMO_DUO_E2E=true` somente no servidor Vite dele. Isso evita que um cache de desenvolvimento interfira no estado isolado de cada teste. O PWA continua disponível no desenvolvimento manual; para validar cache e instalação, gere a build e use `pnpm run preview` em localhost ou HTTPS.

Prefira testar resultado observável e regras de domínio. Em React Testing Library, use consultas próximas da interação real, como papel, label ou texto.

## Gates obrigatórios

Antes de considerar uma alteração concluída, execute:

~~~bash
pnpm run lint
pnpm run test
GITHUB_ACTIONS=true GITHUB_REPOSITORY=lucandradeforte/ritmo-duo pnpm run build
git diff --check
~~~

Reporte qualquer gate não executado ou falha preexistente de forma explícita. Revise também o diff para confirmar que não há mudanças fora do escopo.

## Checklist manual de interface

Depois de mudança relevante de UI, sessão ou PWA:

- Revise 360, 375, 390, 412 e 430 px de largura.
- Verifique tema claro, escuro e do sistema.
- Teste navegação inferior, safe areas, modais e teclado numérico.
- Faça uma sessão solo curta, recarregue e retome.
- Faça uma sessão em dupla, alternando os perfis.
- Teste offline depois do cache inicial.
- Verifique atualização de service worker com e sem treino ativo.

Para mudanças de PWA ou interação móvel, confirme em dispositivo físico:

| Dispositivo | Verificações principais |
| --- | --- |
| iPhone 16e no Safari | Instalação pela Tela de Início, safe areas, teclado, mídia, offline e retorno de background. |
| Galaxy A55 no Chrome | Instalação, inputs, Wake Lock, recuperação, offline e modo standalone. |
| Galaxy A55 no Samsung Internet | Orientação para instalar pelo Chrome, inputs, scroll, mídia, service worker e backup no navegador. |

Emulação não substitui essa validação.

## Publicação

O workflow **.github/workflows/deploy.yml** executa a mesma validação em pull requests e em push para main:

~~~text
pnpm install com lockfile congelado
  → lint
  → testes
  → build
  → testes E2E em Chromium
  → configuração, artefato e deploy no GitHub Pages somente fora de pull requests
~~~

O job de deploy aceita apenas push na **main** ou **workflow_dispatch**. Pull requests nunca configuram Pages, enviam o artefato de publicação ou executam deploy. Não versione a pasta **dist**. O base path é calculado pelo repositório em GitHub Actions.

Os jobs **build** e **e2e** executam em paralelo. Apenas o build grava o cache do pnpm, evitando disputa pela mesma chave; os dois preservam `pnpm install --frozen-lockfile`. As actions de GitHub Pages são fixadas nas SHAs oficiais de `configure-pages@v6`, `upload-pages-artifact@v5` e `deploy-pages@v5`, que usam a linha Node 24.

Não faça commit, push, reset, rebase ou operações destrutivas de Git sem solicitação explícita.

## Documentação e skills

Atualize a documentação junto com mudanças que alterem contrato, uso ou manutenção:

- **README.md** para porta de entrada, comandos e links.
- **docs/guia-do-usuario.md** para comportamento visível ao usuário.
- **docs/arquitetura.md** para camadas, fluxos e invariantes.
- **docs/desenvolvimento.md** para setup, procedimentos e validação.
- A skill correspondente em **skills/** quando uma decisão não óbvia passar a ser estável e reutilizável.

Evite colocar instruções genéricas ou regras temporárias nas skills. Elas devem registrar apenas o contexto do Ritmo Duo que muda decisões futuras.
