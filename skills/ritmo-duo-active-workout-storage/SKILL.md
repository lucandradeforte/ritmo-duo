---
name: ritmo-duo-active-workout-storage
description: Change Ritmo Duo active sessions, duo flow, set/cardio recording, timers, IndexedDB, history or backup without compromising recovery and data integrity.
---

# Ritmo Duo active workout and storage

Use this skill for work in src/features/active-workout, session-related code in src/app, src/storage, src/types/session.ts or src/utils that affects sessions, timers, history, progress or backup.

## Read first

- ../../docs/arquitetura.md
- ../../src/types/session.ts
- ../../src/utils/session.ts
- ../../src/utils/timer.ts
- ../../src/utils/workout-completion.ts
- Relevant files in ../../src/storage
- ../../src/storage/storage.test.ts and nearby tests

## Session invariants

- There is one persisted ActiveWorkoutState per device.
- Persist meaningful active-workout changes immediately and preserve AppController's serialized write queue.
- Use timestamps as the source of truth for rest, cardio duration and total session duration. Never make an interval counter authoritative.
- A duo session contains independent sessions for each participant but only one rest timer in the active state.
- Do not mix participant records when switching the active person.
- Completion must atomically store completed sessions, update exercise progress and remove the active workout.
- Cardio completion and the final save gate matter for finalization; do not silently change the current product rules for incomplete strength sets without explicit approval.

## Storage and backup

- Do not use localStorage or direct IndexedDB calls from UI components.
- A schema change requires a storage version bump, migration, schema update, backup validation update and tests.
- Validate a backup before clearing stores. Import is replacement, so its UI caller must ask for confirmation.
- Keep backup data per profile and include active workout, preferences, history and exercise progress consistently.

## Validate

Use fake-indexeddb-backed tests for recovery, atomic completion, duo pending behavior and backup compatibility. Test a reload/recovery path manually when changing persistence or timers, then run the full gates from ../../docs/desenvolvimento.md.
