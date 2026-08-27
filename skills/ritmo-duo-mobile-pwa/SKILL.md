---
name: ritmo-duo-mobile-pwa
description: Change Ritmo Duo PWA behavior, GitHub Pages assets, Workbox cache, device capabilities or mobile layout without interrupting active training.
---

# Ritmo Duo mobile and PWA

Use this skill for vite.config.ts, index.html, src/pwa, public assets, exercise media, PWA-related UI or mobile compatibility work.

## Read first

- ../../docs/arquitetura.md
- ../../vite.config.ts
- ../../index.html
- Relevant files in ../../src/pwa
- ../../src/utils/public-asset.ts
- Relevant media and PWA tests

## PWA and publication invariants

- Keep Vite base compatible with GitHub Pages subpaths and keep HashRouter.
- Resolve runtime public assets through resolvePublicAssetPath instead of root-absolute paths.
- Keep WebP included in the production precache.
- Do not add duplicate precache entries for assets Workbox already discovers.
- Use prompt-style service-worker updates. A new version must not reload or interrupt an active workout.
- Test the production build with GitHub Actions variables whenever base paths, manifest, assets or cache behavior changes.

## Mobile invariants

- Safe areas apply to headers, bottom navigation, modals and fixed actions.
- Prefer dynamic viewport units with fallback rather than relying only on 100vh.
- Keep primary touch targets at least 44 CSS px and numeric input text at least 16 px.
- Respect prefers-reduced-motion. Exercise media must retain explicit play/pause and poster fallback.
- Gate optional audio, vibration and Wake Lock with feature detection and preserve visual fallbacks.
- External media is optional; its absence offline must not block training.

## Validate

Run the asset integrity test through the normal test suite and the GitHub Pages build. For material mobile or PWA changes, manually verify install, standalone, offline, background recovery and update behavior on iPhone Safari and Galaxy Chrome or Samsung Internet.
