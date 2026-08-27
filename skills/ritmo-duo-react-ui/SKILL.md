---
name: ritmo-duo-react-ui
description: Build or adjust Ritmo Duo screens, routes and shared React components while preserving the controlled UI architecture, CSS Modules and mobile accessibility.
---

# Ritmo Duo React UI

Use this skill for changes in src/app, src/features, src/components, src/hooks or adjacent CSS Modules that alter rendered interaction, navigation or accessibility.

## Read first

- ../../docs/arquitetura.md
- The target feature, its CSS Module and a similar existing component
- ../../src/components/ui for Button, Surface, Modal and profile controls
- Relevant feature tests

## Preserve UI ownership

- AppController owns cross-screen state, active-workout orchestration, storage callbacks and global feedback.
- Features should receive typed data and callbacks. Do not introduce IndexedDB calls, global stores or duplicated domain state inside them.
- Use lazy route boundaries already established in App.tsx for secondary screens.
- Keep HashRouter route behavior and the bottom navigation pattern. The active workout intentionally has no bottom navigation.
- Reuse existing UI primitives before adding a parallel component family.

## Interaction and accessibility

- Cover loading, error, empty and success states where the feature needs them.
- Preserve native button and input semantics, labels, visible focus and keyboard flow.
- Use the existing Modal and BottomSheet primitives for dialogs so focus trapping, Escape and restoration remain intact.
- Keep numeric inputs suitable for mobile keyboards.
- Do not make essential behavior depend on hover, swipe, vibration, sound or Wake Lock.

## Styling

- Place local styles in the adjacent CSS Module.
- Reuse tokens from src/styles/global.css; avoid hardcoded visual systems and global CSS leaks.
- Preserve dark, light and system theme behavior.
- For changes touching safe areas, viewport units, animation or PWA surfaces, also load ritmo-duo-mobile-pwa.

## Validate

Add or update user-facing tests with Testing Library queries based on roles, labels or text. Review affected widths from 360 to 430 px and run full gates from ../../docs/desenvolvimento.md.
