---
name: ritmo-duo-training-domain
description: Modify Ritmo Duo profiles, plans, exercises, training phases, RIR/RPE or progression while preserving typed domain data and product safeguards.
---

# Ritmo Duo training domain

Use this skill when changing files under src/data, src/types or training-related src/utils, including exercises, demonstrations, profiles, plans, phases, RIR/RPE, cardio and progression.

## Read first

- ../../docs/arquitetura.md
- ../../src/types/domain.ts
- ../../src/types/session.ts when a change affects recorded sessions
- Relevant files in ../../src/data
- Relevant tests in ../../src/data and ../../src/utils

## Preserve the model

- Keep plan and exercise content in src/data. Components may display it but must not duplicate series, repetitions, rest, equipment or safety text.
- Use the factories in src/data/workout-plans/shared.ts for shared prescription shapes and stable ids.
- Keep UserId separation intact. A template, progress record and historical session always belong to exactly one profile.
- The active phase is based on completed sessions, not calendar dates. Preserve the 14-day inactivity reset unless the user explicitly requests a product change.
- Double progression is assistive. It can suggest a change but must never write a new load automatically.
- Do not invent equipment capabilities or turn support content into medical advice.

## New or changed exercises

When an exercise receives a local demonstration:

1. Add or update the typed exercise in src/data/exercises.
2. Register the typed demonstration in src/data/exercise-demonstrations.ts.
3. Provide both public/exercise-media/<id>.webp and public/exercise-media/<id>-poster.webp.
4. Keep runtime paths compatible with resolvePublicAssetPath.
5. Extend data or asset integrity tests as needed.

Do not replace local offline media with external GIFs or an internet-only dependency.

## Validate

Cover changed domain behavior with focused tests, then run the full project gates from ../../docs/desenvolvimento.md. Update the user guide when a visible plan, phase or exercise behavior changes.
