---
name: ritmo-duo-project-context
description: Apply Ritmo Duo product boundaries, architecture conventions, documentation and quality gates to any non-trivial change in this repository.
---

# Ritmo Duo project context

Use this skill for any non-trivial change in the Ritmo Duo repository. Combine it with the most specific Ritmo Duo skill for the requested area.

## Establish context

Before editing, read:

1. ../../README.md
2. ../../docs/arquitetura.md
3. ../../docs/desenvolvimento.md
4. The relevant source, types and tests

If codex.md is present, read it as supplemental current product context. It may be untracked, so do not overwrite it or treat it as the only durable documentation unless the user explicitly asks to version it.

## Product boundaries

- The app is client-side and offline-first. Do not add backend, accounts, cloud sync, telemetry or analytics without explicit authorization.
- Lucas and Geovanna are separate data domains. Never mix their historical sessions, progress, cardio or preferences.
- Training plans are support content, not medical diagnosis. Do not change health guidance, equipment assumptions, exercises or prescription values without explicit authorization.
- Keep diffs focused. Prefer existing features, components, utilities and storage APIs over new architecture.

## Architecture rules

- Keep prescriptions and exercise instructions in src/data; keep contracts in src/types.
- Put deterministic rules in src/utils and cover them with tests.
- Route all IndexedDB access through src/storage.
- Treat src/app/App.tsx as the composition root. Do not move persistence logic into feature components.
- Use CSS Modules for local styling and existing global tokens for shared values.
- Preserve HashRouter and the GitHub Pages base-path behavior.

## Completion

Run the gates documented in ../../docs/desenvolvimento.md:

~~~bash
pnpm run lint
pnpm run test
GITHUB_ACTIONS=true GITHUB_REPOSITORY=lucandradeforte/ritmo-duo pnpm run build
git diff --check
~~~

For user-visible behavior, update the relevant document in ../../docs and report validations that were not run.
