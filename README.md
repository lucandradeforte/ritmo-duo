# Ritmo Duo

Aplicação mobile-first para acompanhar os treinos de Lucas e Geovanna na academia do condomínio. O foco é registrar uma série com poucos toques, respeitar as progressões individuais e continuar funcionando quando a conexão da academia falhar.

O Ritmo Duo funciona inteiramente no aparelho: não há login, servidor próprio ou envio do histórico para terceiros. Cada navegador mantém seus próprios dados locais.

## Principais recursos

- Treinos A, B e C individualizados para Lucas e Geovanna.
- Registro rápido de carga, repetições, RIR e séries concluídas.
- Recuperação de treino em andamento após fechar, suspender ou recarregar o app.
- Cronômetro de descanso calculado por timestamps reais.
- Modo dupla com alternância rápida entre os dois perfis.
- Histórico, volume, consistência, recordes e sugestões de progressão.
- Cardio em esteira ou bicicleta com duração, intensidade e RPE.
- Instruções técnicas e alternativas de cada exercício disponíveis offline.
- Doze demonstrações animadas locais, com poster estático e controle de pausa.
- Dark mode, light mode e preferência persistida.
- Backup e restauração em JSON.
- PWA instalável, offline-first e compatível com GitHub Pages.

## Stack

- React 19 e TypeScript com tipagem estrita.
- Vite.
- React Router com `HashRouter`, evitando erro 404 ao atualizar rotas no GitHub Pages.
- CSS Modules e tokens CSS globais.
- IndexedDB por meio de uma camada de storage versionada.
- `vite-plugin-pwa` e Workbox.
- Vitest e Testing Library.
- Lucide React.

## Requisitos

- Node.js 22.
- npm 10 ou superior para execução local; o CI usa pnpm 11.19 com lockfile congelado.

## Execução local

### PowerShell — Windows 11

```powershell
npm install
npm run dev
```

### Bash — WSL2/Ubuntu

```bash
npm install
npm run dev
```

O Vite exibirá o endereço local no terminal. Para abrir em outro dispositivo da mesma rede durante o desenvolvimento, execute `npm run dev -- --host` e use o endereço de rede informado. Recursos que exigem contexto seguro, como service worker e Wake Lock, devem ser validados em `localhost` ou HTTPS.

## Validação e build

Execute no PowerShell ou no Bash/WSL2, sem misturar a sintaxe dos ambientes:

```bash
npm run lint
npm run test
npm run build
npm run preview
```

O build de produção é gerado em `dist/`.

Para recriar os ícones do aplicativo após alterar `public/favicon.svg`:

```bash
npm run assets
```

O ícone representa a identidade do produto: a placa verde simboliza Lucas, a laranja simboliza Geovanna, o halter representa a musculação e o traço branco combina ritmo, constância e progresso.

## GitHub Pages

O arquivo `.github/workflows/deploy.yml` executa automaticamente:

```text
push na main
→ pnpm install --frozen-lockfile
→ lint
→ testes
→ build
→ publicação no GitHub Pages
```

Configuração inicial do repositório:

1. Publique o projeto em um repositório no GitHub.
2. Abra **Settings → Pages**.
3. Em **Build and deployment → Source**, escolha **GitHub Actions**.
4. Faça push para a branch `main`.
5. Acompanhe o workflow em **Actions** e, ao concluir, abra a URL mostrada no deployment `github-pages`.

O `base` do Vite é calculado a partir de `GITHUB_REPOSITORY` durante o GitHub Actions. Assim, manifest, service worker e assets funcionam em URLs no formato:

```text
https://usuario.github.io/nome-do-repositorio/
```

Não é necessário publicar ou versionar a pasta `dist/`.

## PWA e comportamento offline

O app inclui manifest, ícones comuns e maskable, `apple-touch-icon`, metatags para iOS e service worker. O app shell, os dados dos treinos, as instruções textuais e as demonstrações animadas são cacheados. Registrar e finalizar um treino não depende de rede.

Links e vídeos hospedados por terceiros continuam dependendo de conexão. Se estiver offline, o treino e as demonstrações locais permanecem utilizáveis; apenas a referência externa pode ser consultada depois.

As animações iniciam automaticamente quando a preferência de movimento reduzido não está ativa e sempre oferecem uma ação explícita de pausa. Com `prefers-reduced-motion: reduce`, o poster estático é exibido por padrão e a animação só começa após toque do usuário.

Quando uma nova versão está disponível, o app solicita confirmação antes de atualizar. Durante um treino ativo, a atualização fica adiada para não interromper a sessão.

### Instalação no iPhone 16e

1. Abra a aplicação pelo **Safari**.
2. Toque em **Compartilhar**.
3. Selecione **Adicionar à Tela de Início**.
4. Quando exibido, mantenha **Abrir como App** ativado.
5. Toque em **Adicionar**.

O iOS não oferece o mesmo prompt programático do Chrome. Por isso, o Ritmo Duo mostra essa orientação contextual apenas enquanto o app ainda não estiver instalado e a ajuda não tiver sido dispensada.

### Instalação no Galaxy A55 — Chrome

1. Abra a aplicação pelo **Google Chrome**.
2. Toque em **Instalar aplicativo** no aviso do Ritmo Duo; ou abra o menu do Chrome e selecione **Instalar aplicativo**.
3. Confirme a instalação.

### Instalação no Galaxy A55 — Samsung Internet

1. Abra a aplicação pelo **Samsung Internet**.
2. Abra o menu do navegador.
3. Use **Adicionar página a → Tela inicial** ou a opção de instalação apresentada pela versão instalada.
4. Confirme.

Se o Ritmo Duo já estava instalado antes de uma atualização de ícone, remova o atalho antigo e adicione o app novamente à Tela de Início para contornar o cache de ícones do sistema.

Vibração, Wake Lock e prompt nativo de instalação usam feature detection. Quando o navegador não oferece uma API, o app mantém feedback visual e o restante do treino continua normalmente.

## Dados, backup e restauração

O histórico é salvo no IndexedDB do navegador, com schema versionado. Cada mudança importante de uma sessão ativa é persistida imediatamente; não é necessário aguardar o fim do treino.

Para trocar de aparelho ou navegador:

1. Abra **Perfil/Configurações → Exportar backup**.
2. Salve o arquivo `treino-backup.json` em um local seguro.
3. No novo aparelho, abra **Importar backup** e selecione o arquivo.
4. Revise a confirmação antes de substituir os dados locais.

Exporte um backup antes de limpar dados do navegador, remover o web app ou restaurar o aparelho. O GitHub Pages hospeda apenas a aplicação; ele não sincroniza o histórico entre o iPhone e o Galaxy.

## Estrutura do projeto

```text
src/
├── app/                  # shell, rotas e composição
├── components/           # componentes compartilhados
├── data/                 # perfis, exercícios e fichas reais
├── features/             # treino ativo, histórico, progresso e configurações
├── hooks/                # hooks reutilizáveis
├── pwa/                  # instalação, rede, atualização, feedback e Wake Lock
├── storage/              # IndexedDB, migrations e backup
├── styles/               # tokens e estilos globais
├── types/                # contratos do domínio
└── utils/                # regras e cálculos puros
```

## Compatibilidade prioritária

- iPhone 16e: Safari e modo standalone pela Tela de Início.
- Galaxy A55: Chrome, Samsung Internet e modo standalone.
- Outros celulares modernos entre aproximadamente 360 e 430 CSS px.
- Tablet e desktop como experiências secundárias.

O layout usa safe areas, `viewport-fit=cover`, unidades dinâmicas de viewport e inputs com pelo menos 16 px. Nenhuma ação essencial depende de hover, swipe, vibração, áudio ou Wake Lock.

# Teste em dispositivos reais

Emulação ajuda no desenvolvimento, mas não substitui esta rodada nos aparelhos físicos depois da publicação em HTTPS.

## iPhone 16e — Safari e PWA

- [ ] Abrir a URL no Safari, selecionar Lucas e iniciar um treino.
- [ ] Confirmar que header, ações fixas e bottom navigation não invadem as safe areas.
- [ ] Focar carga e repetições; conferir teclado adequado e ausência de zoom automático.
- [ ] Rolar listas, abrir instruções e fechar modais em portrait e landscape.
- [ ] Instalar por **Compartilhar → Adicionar à Tela de Início**.
- [ ] Abrir pela Tela de Início e confirmar modo standalone, ícone e status bar.
- [ ] Concluir uma série, bloquear a tela, aguardar e conferir o descanso pelo horário real.
- [ ] Fechar o PWA durante um treino e confirmar a oferta para continuar a sessão.
- [ ] Ativar modo avião e confirmar fichas, registro, histórico e instruções textuais.
- [ ] Confirmar que mídia externa offline apresenta fallback e não bloqueia o treino.
- [ ] Verificar que falta de vibração ou Wake Lock não prejudica o fluxo.

## Galaxy A55 — Chrome

- [ ] Abrir a URL, instalar pelo prompt ou menu e iniciar em standalone.
- [ ] Conferir bottom navigation com botões do sistema e navegação por gestos.
- [ ] Testar Samsung Keyboard e Gboard, se disponíveis, nos campos numéricos.
- [ ] Ativar vibração e confirmar feedback; desativá-la e confirmar fallback visual.
- [ ] Ativar **Manter tela ativa durante treino** e conferir liberação ao finalizar.
- [ ] Colocar o app em background durante o descanso e validar a recomposição do tempo.
- [ ] Encerrar o app durante uma sessão e confirmar recuperação sem perder a última série.
- [ ] Ativar modo avião e realizar uma sessão curta até salvar no histórico.
- [ ] Alternar portrait/landscape e verificar modal, scroll e cronômetro.

## Galaxy A55 — Samsung Internet

- [ ] Repetir seleção de perfil, treino ativo, conclusão de série e histórico.
- [ ] Validar instalação pela opção disponível no menu do navegador.
- [ ] Conferir inputs decimais/numéricos com Samsung Keyboard.
- [ ] Verificar scroll, bottom navigation, modais e vídeos em portrait/landscape.
- [ ] Confirmar service worker e reabertura offline.
- [ ] Exportar um backup, importar após confirmação e revisar os dados restaurados.

## Privacidade

O Ritmo Duo não possui telemetria, autenticação nem backend nesta versão. Dados pessoais, cargas e histórico permanecem no storage local do navegador, exceto quando o próprio usuário exporta um backup.
