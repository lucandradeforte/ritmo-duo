# Contexto do projeto — Ritmo Duo

Este arquivo registra o contexto consolidado do desenvolvimento realizado até **27 de agosto de 2026**. Ele deve ser lido pelo próximo agente antes de alterar o projeto. Seu objetivo é preservar decisões de produto, arquitetura, PWA, dados de treino, UX e publicação.

> Regra de prioridade: instruções atuais do usuário prevalecem sobre este documento. Não trate este arquivo como fonte médica; o plano de treino é um conteúdo de apoio para o aplicativo e deve ser ajustado somente com autorização explícita dos usuários.

## 1. Projeto e objetivo

**Nome:** Ritmo Duo<br>
**Repositório:** `lucandradeforte/ritmo-duo`<br>
**URL publicada:** https://lucandradeforte.github.io/ritmo-duo/<br>
**Branch principal:** `main`
**Hospedagem:** GitHub Pages, publicada automaticamente por GitHub Actions.

O Ritmo Duo é uma PWA mobile-first para Lucas e Geovanna registrarem treinos de musculação na academia do condomínio. A aplicação foi desenhada para uso rápido entre séries, em celulares, sem backend e com funcionamento offline.

Prioridades de produto:

1. Conforto de uso no iPhone 16e (Safari/iOS, inclusive instalado na Tela de Início).
2. Conforto de uso no Samsung Galaxy A55 (Chrome e Samsung Internet).
3. Registro rápido e seguro durante o treino.
4. Persistência e recuperação de sessão em caso de fechamento/suspensão do navegador.
5. Plano real de Lucas e Geovanna — não mock genérico.
6. PWA, offline, histórico, progressão e modo treino em dupla.

## 2. Perfis e contexto de treino

### Lucas

- Homem, 24 anos.
- 183 cm, 110 kg.
- Prioridade: emagrecimento; objetivo secundário: ganho de massa muscular.
- Mais de um ano sem academia, ritmo sedentário.
- Prefere esteira.
- Relatou conseguir aproximadamente 15 min de caminhada em velocidade 5, alternando subidas para 8 por cerca de 5 min e descidas a cada 5 min. Isso é referência inicial, não prescrição rígida.

### Geovanna

- Mulher, 25 anos.
- 161 cm, 118 kg.
- Prioridade: emagrecimento; objetivo secundário: saúde.
- Mais de um ano sem academia, ritmo sedentário.
- A bicicleta foi considerada a opção de cardio inicial preferencial por ser de menor impacto e mais confortável para ela.

### Premissas compartilhadas

- Dias pretendidos: terça, quinta e sexta.
- Limite desejado: até 1h30 na academia.
- Não relataram condição de saúde impeditiva, lesões ou restrições médicas conhecidas.
- Querem estar na academia no mesmo horário, mas não precisam realizar todos os exercícios juntos.
- Já utilizaram a multiestação tranquilamente e com segurança, porém somente uma pessoa por vez.
- A abordagem definida é conservadora: técnica, adaptação gradual, RIR/RPE, sem falha muscular sistemática, sem HIIT agressivo e sem impacto elevado desnecessário no início.

## 3. Academia e equipamentos considerados

As imagens originais da academia não ficaram acessíveis nesta execução do Codex; portanto, a implementação foi baseada nas informações confirmadas pelo usuário e no plano já estruturado.

Equipamentos em escopo:

- 2 esteiras, sendo ao menos uma Movement.
- Bicicleta ergométrica Evolution Fitness B-302 (aparente).
- Halteres, barra, anilhas, pesos livres e banco.
- Bola suíça/de estabilidade.
- Multiestação Tander Fitness TMEDM, torre de aproximadamente 68 kg.

Na multiestação, as funções utilizadas no plano/dados do aplicativo são apenas as que foram tratadas como disponíveis e seguras: puxada frontal na polia alta, peck deck/crucifixo e extensão de pernas. Não adicionar exercícios que dependam de acessórios não confirmados sem nova confirmação visual do usuário.

## 4. Plano utilizado como regra de negócio

O plano foi estruturado para adaptação e progressão, com exercícios em dados tipados. A lista exata, séries, repetições, RIR, descanso, equipamentos e instruções deve ser mantida em `src/data/` e tipos em `src/types/`; não duplicar prescrições dentro de componentes.

Os exercícios com demonstrações locais atualmente adicionadas são:

1. Supino com halteres / `dumbbell-chest-press`.
2. Puxada frontal na Tander / `tander-lat-pulldown`.
3. Agachamento goblet até o banco / `goblet-squat-to-bench`.
4. Levantamento terra romeno com halteres / `dumbbell-romanian-deadlift`.
5. Remada unilateral com halter / `single-arm-dumbbell-row`.
6. Desenvolvimento lateral com halteres / `dumbbell-lateral-raise`.
7. Rosca sentada com halteres / `seated-dumbbell-curl`.
8. Extensão de tríceps acima da cabeça com halter / `overhead-dumbbell-triceps-extension`.
9. Elevação de panturrilha em pé / `standing-calf-raise`.
10. Caminhada do fazendeiro / `farmer-carry`.
11. Peck deck na Tander / `tander-pec-deck`.
12. Extensão de pernas na Tander / `tander-leg-extension`.

Princípios de progressão:

- Usar faixa de repetições e RIR/RPE em vez de carga fixa universal.
- Aplicar progressão dupla: aumentar repetições dentro da faixa com técnica e RIR adequados; ao atingir o teto em todas as séries, sugerir aumento de carga no próximo treino.
- A sugestão é assistiva, nunca deve alterar a carga automaticamente.
- Para torres com saltos grandes de carga, usar mais repetições, mais controle técnico ou séries adicionais conforme a prescrição, antes de forçar um salto de peso.

## 5. Stack e arquitetura

Tecnologias escolhidas:

- React + TypeScript.
- Vite.
- CSS próprio/modular do projeto, sem Material UI ou estética de dashboard corporativo.
- Lucide React para ícones.
- Vitest + Testing Library.
- `vite-plugin-pwa`/Workbox para manifest, service worker e cache de produção.
- Persistência exclusivamente client-side, encapsulada por uma camada de storage. Não introduzir backend, autenticação externa ou chamadas diretas de storage espalhadas pela UI.

Estrutura conceitual atual:

```text
src/
├── components/
├── data/
│   ├── exercises/
│   ├── exercise-demonstrations.ts
│   └── workout plans/users
├── features/
│   ├── active-workout/
│   ├── exercises/
│   ├── history/
│   ├── progress/
│   ├── settings/
│   ├── users/
│   └── workouts/
├── hooks/
├── storage/
├── types/
├── utils/
└── test/
```

Arquitetura desejada:

- Dados de domínio tipados e centralizados.
- Componentes de visualização sem regras complexas de persistência.
- Hooks para estado/efeitos de UI.
- Storage com versão/migração e APIs específicas por domínio.
- Evitar Redux sem necessidade; manter estado local/contextual quando suficiente.
- Evitar `any`, casts desnecessários e hardcode de dados de treino nos componentes.

## 6. Experiência principal

Fluxo principal:

```text
Selecionar perfil → ver treino sugerido → iniciar → registrar carga/repetições/RIR
→ concluir série → descanso cronometrado → próximo exercício → finalizar → histórico/progressão
```

Telas e comportamentos importantes:

- Seleção inicial de perfil: Lucas ou Geovanna, sem login.
- Home: foco em “iniciar treino”, último treino, progresso semanal e próximo treino.
- Bottom navigation: Hoje, Treinos, Histórico, Progresso e Perfil.
- Tela de treino: cards/linhas móveis em vez de tabela HTML apertada; editar carga e repetições no próprio contexto.
- Descanso: cronômetro em overlay/bottom sheet com `-15s`, `+15s` e “Pular”.
- Treino em dupla: alternância rápida entre Lucas e Geovanna na mesma estação, preservando registros independentes.
- Cardio: suporte a esteira e bicicleta com duração, dados opcionais e RPE.
- Instruções de execução: mídia, texto técnico, equipamentos e orientações devem continuar acessíveis sem internet quando forem recursos locais.

## 7. PWA, offline e compatibilidade

### Requisitos de compatibilidade

Alvos principais:

- iPhone 16e: Safari, navegador e modo instalado/standalone.
- Galaxy A55: Chrome para instalação da PWA; Samsung Internet para uso no navegador.

Cuidados obrigatórios já previstos no código:

- `viewport-fit=cover` e uso de `env(safe-area-inset-*)` em header, navegação inferior, modais e ações fixas.
- Não depender apenas de `100vh`; preferir unidades dinâmicas como `dvh`/`svh` com fallback.
- Alvos de toque de pelo menos 44 × 44 CSS px; ações frequentes maiores.
- Inputs numéricos com `inputmode` apropriado e fonte mínima de 16 px para evitar zoom automático do Safari.
- Sem dependência funcional de hover ou swipe.
- Feature detection para APIs opcionais, por exemplo `navigator.vibrate` e Wake Lock.
- `prefers-reduced-motion` respeitado.
- O Samsung Internet pode criar um APK próprio cuja instalação é bloqueada pelo Play Protect em Android recente. Não exibir o prompt nativo nesse navegador; orientar a abertura da mesma URL no Chrome e nunca sugerir desativar o Play Protect.

### Offline-first

O treino não pode depender da rede. Devem funcionar offline:

- Fichas e instruções textuais.
- Sessões em andamento e registros de séries.
- Histórico, cargas, progressão e preferências.
- Demonstrações locais dos exercícios.

Vídeos de referências externas podem depender de conexão; a indisponibilidade externa nunca deve bloquear a execução do treino.

### Recuperação de sessão e timers

Toda alteração relevante durante o treino deve ser persistida imediatamente: início, exercício atual, séries, cargas, repetições, RIR e cardio.

Cronômetros não devem depender de `setInterval()` como fonte de verdade. A fonte de verdade é timestamp:

```ts
remaining = restDuration - (Date.now() - restStartedAt);
```

Ao retornar de background, recalcular o restante. A duração total do treino segue a mesma lógica.

Atualizações do service worker não devem interromper treino ativo. Quando houver versão nova, avisar e permitir atualização após a sessão, não de forma silenciosa.

## 8. Demonstrações animadas dos exercícios

Foram criados recursos locais para não depender de YouTube nem conexão durante o treino:

- Diretório: `public/exercise-media/`.
- Para cada um dos 12 exercícios há dois arquivos:
  - `<id>.webp`: animação leve em WebP.
  - `<id>-poster.webp`: quadro estático/poster.
- Total: 24 arquivos WebP.
- As demonstrações são didáticas/ilustrativas e não substituem instruções escritas, amplitude segura ou orientação profissional presencial.

Implementação importante:

- Tipo: `ExerciseDemonstration` em `src/types/domain.ts`.
- Catálogo: `src/data/exercise-demonstrations.ts`.
- Associação ao exercício: `src/data/exercises/index.ts`.
- Helper de caminho: `src/utils/public-asset.ts`, obrigatório para respeitar `import.meta.env.BASE_URL` no GitHub Pages.
- Hook: `src/hooks/usePrefersReducedMotion.ts`, com fallback para Safari legado (`addListener`/`removeListener`).
- Componente: `src/features/exercises/ExerciseMedia.tsx`.

Comportamento de `ExerciseMedia`:

- Por padrão carrega o WebP animado local.
- Há controle explícito de pausar/reproduzir, inclusive por acessibilidade; não depende de hover.
- Em `prefers-reduced-motion`, inicia com poster estático e permite reproduzir quando o usuário tocar.
- Se a animação falhar, faz fallback para o poster.
- A mídia usa caminhos compatíveis com a subpasta `/ritmo-duo/` do Pages.
- A tela de detalhes possui botão de execução explícito, não apenas um ícone pequeno.

Não substituir essas mídias por GIFs externos pesados. Se forem adicionados novos exercícios, gerar/adicionar um par `webp` + `poster.webp`, registrar no catálogo tipado e estender o teste de integridade de assets.

## 9. Identidade visual e ícones

Tema: dark mode prioritário, com superfícies grafite, alto contraste e cores energéticas. Há suporte a light mode, `prefers-color-scheme`, escolha manual e persistência de preferência.

O ícone `v3` comunica o propósito fitness da aplicação:

- Atleta em verde-limão: movimento, constância e progresso.
- Barra em coral: musculação e força.
- Fundo grafite: contraste em launcher, navegador e modo instalado.

Arquivos relevantes:

- `src/components/brand/BrandMark.tsx`.
- `public/app-icon-v3-source.png`.
- `public/apple-touch-icon-v3.png`.
- `public/pwa-icon-v3-192x192.png`.
- `public/pwa-icon-v3-512x512.png`.
- `public/pwa-icon-v3-maskable-512x512.png`.
- `scripts/generate-icons.mjs` para regenerar os ícones.

Em iOS, a atualização do `apple-touch-icon` não é garantida para atalhos já instalados: para receber o novo ícone, remover o atalho antigo e adicioná-lo novamente pela opção “Adicionar à Tela de Início” do Safari.

## 10. Build, GitHub Pages e publicação

O deploy é acionado por push na `main` e executa install, lint, testes, build e deploy Pages.

Configurações essenciais:

- Vite deve manter `base` compatível com `https://lucandradeforte.github.io/ritmo-duo/`.
- Manifest, service worker, imagens, vídeos/visuais e outros assets públicos devem respeitar esse base path.
- O worker deve incluir WebP no cache de produção.
- Não duplicar manualmente assets que já são descobertos pelo Workbox; isso aumentava a precache sem benefício e já foi corrigido.

Último commit de referência:

```text
333d8223133f0d7ca52306ed44b68249954837a1
feat: add offline exercise animations and refresh branding
```

Situação confirmada em 27/08/2026:

- Push concluído pelo usuário.
- GitHub Actions “Validar e publicar no GitHub Pages”, execução `33037942388`, concluída com `success`.
- URL da execução: https://github.com/lucandradeforte/ritmo-duo/actions/runs/33037942388

## 11. Validações já realizadas

Antes da publicação do commit acima, foram executados com sucesso:

```bash
pnpm run lint
pnpm run test
GITHUB_ACTIONS=true GITHUB_REPOSITORY=lucandradeforte/ritmo-duo pnpm run build
```

Resultados observados:

- Lint aprovado.
- 18 arquivos de teste, 58 testes aprovados.
- Build do GitHub Pages aprovado.
- Service worker gerado e precache contendo os 24 recursos WebP das demonstrações.
- `git diff --check` sem problemas de whitespace antes do commit.

Revisão visual realizada em navegadores Chromium com dimensões aproximadas de 390 × 844 e 412 × 915:

- Sem overflow horizontal.
- Sem alvos de toque detectados abaixo do mínimo desejado nas ações principais.
- Sem erros de console ou de página observados.
- Mídias locais renderizando em tamanho confortável em mobile.
- Pausar/reproduzir, reduced motion e fallback para poster validados.

Limitação conhecida: emulação não substitui validação em dispositivos físicos. Depois de alterações relevantes de UI/PWA, testar manualmente no iPhone 16e e Galaxy A55.

## 12. Testes existentes e cobertura crítica

Áreas que precisam permanecer cobertas:

- Cálculo de volume.
- Regras de progressão.
- Persistência/troca de perfil.
- Conclusão de série.
- Recuperação de treino em andamento.
- Cronômetro baseado em timestamps.
- Backup e importação.
- Catálogo de demonstrações e integridade física dos 24 arquivos WebP.
- `ExerciseMedia`: animação padrão, pausa, reduced motion e fallback.
- Caminhos de asset usando o base path do Vite.

O teste de integridade de assets está em `scripts/exercise-media-assets.test.ts`. Ele evita que uma associação de demonstração aponte para arquivo ausente/corrompido.

## 13. Backup e dados locais

O produto é 100% client-side. Cada perfil mantém separadamente ficha, histórico, cargas, progresso e preferências.

Princípios obrigatórios:

- Não acessar `localStorage`/IndexedDB arbitrariamente nos componentes; usar a camada de storage.
- Versionar formato persistido, por exemplo `storageVersion: 1`, e criar migrações compatíveis ao mudar schema.
- Exportar backup JSON com usuários, histórico, cargas e preferências.
- Importar backup deve pedir confirmação, pois substitui dados locais.
- Limpar histórico e quaisquer ações destrutivas devem requerer confirmação explícita.

## 14. Diretrizes para próximas alterações

1. Leia `README.md`, `package.json`, os tipos de domínio e a camada de storage antes de refatorar.
2. Preserve a separação por perfis; nunca misture histórico ou carga de Lucas com Geovanna.
3. Não introduza backend, login, analytics invasivo, bibliotecas grandes ou UI corporativa sem solicitação explícita.
4. Qualquer novo asset público deve usar o helper de base path; testar a build com contexto de GitHub Pages.
5. Em mudanças de PWA, considere cache antigo, atualização com treino ativo e comportamento offline.
6. Em mudanças de cronômetro, não use timer incremental como verdade de negócio; use timestamps.
7. Em recursos opcionais do dispositivo (vibração, áudio, Wake Lock), use feature detection e fallback visual. Áudio deve ser opt-in e iniciado somente após interação do usuário por restrições de autoplay mobile.
8. Mantenha áreas de toque, safe areas, inputs de 16 px e acessibilidade como requisitos funcionais, não detalhes decorativos.
9. Para vídeos externos, usar `playsinline` no iOS e nunca forçar autoplay. A ausência de rede não deve impedir a sessão.
10. Não alterar a prescrição de exercícios/treino como se fosse diagnóstico. Mudanças de saúde, dores ou limitações devem solicitar revisão profissional e consentimento dos usuários.

## 15. Checklist para um próximo agente

Antes de finalizar qualquer alteração:

```bash
pnpm run lint
pnpm run test
GITHUB_ACTIONS=true GITHUB_REPOSITORY=lucandradeforte/ritmo-duo pnpm run build
```

Revisar pelo menos:

- 360, 375, 390, 412 e 430 px de largura.
- Dark e light mode.
- Navegação inferior e safe areas.
- Formulários numéricos com teclado móvel.
- Fluxo completo de treino e recuperação após recarregar a página.
- Offline após a PWA ser instalada/visitada com conexão.
- Treino em dupla alternando os dois perfis.
- Atualização de service worker com e sem treino ativo.

Teste manual em dispositivos reais:

### iPhone 16e / Safari

1. Abrir a URL pelo Safari.
2. Instalar por Compartilhar → Adicionar à Tela de Início.
3. Validar safe areas, scroll, teclado, bottom navigation, mídia, offline, persistência e retorno de background.
4. Se o ícone ainda for o antigo, remover o atalho e adicionar novamente.

### Galaxy A55 / Chrome e Samsung Internet

1. No Chrome, abrir a URL e instalar como PWA quando disponível.
2. No Samsung Internet, confirmar a orientação para abrir a mesma URL no Chrome e validar o uso no navegador.
3. Validar inputs, scroll, mídia, offline, armazenamento, standalone e recuperação de sessão.
4. Quando suportado, validar feedback por vibração sem que o recurso seja requisito para finalizar descanso.

## 16. Comandos de desenvolvimento

No diretório raiz do repositório, usando PowerShell ou WSL conforme o ambiente configurado:

```bash
pnpm install
pnpm run dev
```

Validação e publicação:

```bash
pnpm run lint
pnpm run test
pnpm run build
git add .
git commit -m "tipo: descrição curta"
git push origin main
```

O push para `main` inicia a publicação automática. Confirmar o resultado na aba Actions do repositório e abrir a URL do Pages após o workflow concluir.

## 17. Documentação a manter atualizada

Ao ampliar o produto, atualizar:

- `README.md`: stack, execução, PWA, instalação iOS/Android, backup, testes e compatibilidade.
- Este `codex.md`: decisões de alto nível, mudanças de arquitetura e estado de publicação.
- Tipos e dados de treino quando houver mudança de regra de negócio.
- Testes correspondentes a cada comportamento crítico novo.
