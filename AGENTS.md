# Instruções para agentes — Ritmo Duo

Estas instruções valem para todo o repositório. Preserve o escopo da tarefa e prefira o menor diff que resolva o problema.

## Antes de alterar

1. Leia este arquivo, [README.md](README.md), [docs/arquitetura.md](docs/arquitetura.md) e [docs/desenvolvimento.md](docs/desenvolvimento.md).
2. Leia [codex.md](codex.md) como contexto complementar de produto. Ele pode conter decisões recentes, mas as instruções atuais do usuário têm prioridade.
3. Inspecione os arquivos, tipos e testes relacionados antes de implementar.
4. Carregue integralmente `skills/ritmo-duo-project-context/SKILL.md` em qualquer mudança não trivial e combine-o com a skill específica:
   - `ritmo-duo-training-domain`: planos, exercícios, cardio, RIR/RPE e progressão;
   - `ritmo-duo-active-workout-storage`: sessão ativa, IndexedDB, backup, timers, histórico e progresso;
   - `ritmo-duo-react-ui`: componentes, CSS, acessibilidade e layout;
   - `ritmo-duo-mobile-pwa`: PWA, instalação, offline, iOS, Android, safe areas e viewport.

As skills locais em `skills/` são a referência do projeto. Não conclua que uma orientação está ausente apenas porque não há uma cópia em `.codex/`.

## Limites do produto

- O app é client-side e offline-first: não adicione backend, autenticação, analytics, telemetria ou sincronização em nuvem sem autorização explícita.
- Lucas e Geovanna têm dados independentes. Nunca misture sessões, progresso, cardio, peso ou preferências entre perfis.
- O plano é conteúdo de apoio, não prescrição médica. Não altere exercícios, equipamentos, orientações de saúde ou valores do plano sem autorização explícita.
- Mantenha IndexedDB encapsulado em `src/storage/`; componentes e telas não devem acessá-lo diretamente.
- Preserve `HashRouter`, o base path do GitHub Pages, a persistência imediata da sessão ativa e os timers derivados de timestamps.
- Para alterações visuais/mobile, reutilize CSS Modules e tokens existentes. Valide telas estreitas; iPhone Safari/PWA instalada e Galaxy A55 são os dispositivos prioritários.

## Qualidade e Git

- Use `nvm use` antes das validações; a versão suportada está em `.nvmrc` e `package.json`.
- Atualize testes para comportamentos alterados. Para UI renderizada, verifique primeiro se o Browser plugin está disponível; sem ele, use o Playwright já configurado e registre essa limitação.
- Execute os gates proporcionais à mudança, preferencialmente:

  ```bash
  pnpm run lint
  pnpm run test
  pnpm run test:coverage
  pnpm run test:e2e
  GITHUB_ACTIONS=true GITHUB_REPOSITORY=lucandradeforte/ritmo-duo pnpm run build
  git diff --check
  ```

- Não faça commit, push, reset, limpeza de dados/cache ou descarte de alterações sem solicitação explícita do usuário.
