---
paths:
  - "packages/engine/**"
  - "src/entities/level/**"
  - "src/entities/match/**"
  - "src/features/tap-cell/**"
---

# Game Engine (`@reckon-path/engine`)

The engine is the single implementation of the game rules on the client. **Spec Part 6 (`docs/spec/06-engine-and-content.md`) is normative** and wins over every other source except explicit decisions. The Go server implements the same rules; the two are kept identical by shared test vectors.

## Location and purity

* Lives in `packages/engine/`, imported as `@reckon-path/engine` (`docs/decisions/0001-project-setup.md`).
* Must not import `react`, `react-native`, `expo-*`, any UI, storage, network, or `src/` code. Plain TypeScript only.
* No side effects: no timers, no `Date.now()`, no `Math.random()`, no I/O, no logging, no global mutable state. Time and randomness come in as arguments (seeded PRNG per Part 6 §6.2).
* Integer arithmetic only for distances and costs (Part 6 §2.1) — no floats in game logic.

## Contract

* Data model exactly as Part 6 §1 (`Board`, `LevelRules`, `Reveal`, `GameState`, `Idx`, `EdgeKey`). Field names, unions, and invariants are not renamed or "improved".
* Tap resolution is a pure reducer: `applyTap(state, cell) → { state, events }` (Part 6 §2.2, Part 8 §6.2). The input state is never mutated.
* Every step of the pseudocode is implemented in the specified order (e.g. win check before move-limit check). The pseudocode is the spec; deviations are bugs.
* Level and match flows are explicit state machines (Part 6 §4).
* Formulas (stars, trophies, leagues, RP, XP — Part 6 §5), validator with all error codes, returning all errors (Part 6 §6.1), PRNG FNV-1a-32 + mulberry32 (Part 6 §6.2), daily generator (§6.3), level codes (§7.2) — each as specified.
* Engine input from outside (level JSON, level codes, remote config) is validated with zod against Part 6 §7 schemas at the boundary, before it reaches the engine.

## When the spec is unclear

If the pseudocode, a formula, or an edge case is ambiguous or missing (including cases listed in Part 11), stop and ask — never fill in "typical puzzle game" behaviour. Record the answer in `docs/decisions/` and add a test vector for it.

## Prototypes

`../peleng/src/game/` (web prototype: `engine.js`, `levels.js`, `daily.js`, `levelCode.js`) and `../arena/src/game/` (PvP prototype) are the prototypes the spec refers to (`docs/decisions/0002-setup-follow-ups.md` #3). They live outside this repository, are read-only, and must never be edited. They may be consulted for porting and test-vector material, but where they differ from Part 6, Part 6 wins, and the difference is reported to the developer.

## Tests

* Coverage ≥ 95% of lines (Part 8 §12.3).
* Shared vectors in `packages/engine/vectors/*.json` in the format of Part 6 §9; the mandatory set (≥ 60 vectors, groups in the Part 6 §9 table) is the acceptance bar. Jest runs every vector file; the same files are read by the Go tests — their format must not drift.
* Every bug fix in the engine starts with a failing vector or unit test.
* Property-based tests for connectivity and validator invariants where Part 12.3 requires them.
