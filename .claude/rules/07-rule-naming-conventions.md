# Naming Conventions

## Files and folders

All file and folder names are **kebab-case** (`docs/decisions/0001-project-setup.md`). Spec code examples with `Button.styles.ts` or `gameSessionStore.ts` are illustrative; the kebab-case equivalents are `button-styles.ts`, `game-session-store.ts`.

| What | File | Exported entity |
| --- | --- | --- |
| Component | `level-card.tsx` | `LevelCard` (default export) |
| Component styles (Unistyles) | `level-card-styles.ts` | `styles` |
| Skeleton | `level-card-skeleton.tsx` | `LevelCardSkeleton` |
| Hook | `use-level-progress.ts` | `useLevelProgress` |
| Zustand store | `game-session-store.ts` | `useGameSessionStore` |
| zod schema | `nickname-schema.ts` | `nicknameSchema`, `NicknameSchema` (type) |
| Enum | `probe-mode-enum.ts` | `ProbeModeEnum` |
| Types | `level-type.ts` | `Level`, `LevelRules` |
| Utility | `format-balance.ts` — verb + object | `formatBalance` |
| Constants | `move-limits.ts` in `constants/` | `MOVE_LIMITS` |
| Query/mutation file | `level-queries.ts`, `purchase-item-mutation.ts` | factories + hooks |
| Slice public API | `index.ts` in the slice root | re-exports of the public surface only |
| Unit test | `<file>.test.ts(x)` next to the file | — |
| E2E flow (Maestro) | `e2e/<flow>.yaml` | — |

* One file — one primary entity; file name = entity name in kebab-case.
* No dumping-ground files (`helpers.ts`, `utils.ts`, `common.ts`, `misc.ts`).
* `index.ts` exists only as a slice's public API, not as a re-export barrel inside a slice.
* Route files follow Expo Router conventions (`_layout.tsx`, `[id].tsx`, `(tabs)`); route segments match spec Part 8 §5.2 / Part 4 route keys.

## Code

* Components: `PascalCase` nouns. Props interface `I<ComponentName>` in the same file.
* Variables, functions: `camelCase`; functions are verb + object (`resolveTap`, `computeStars`).
* Booleans: `is` / `has` / `can` / `should` prefix.
* Handlers: `handle<Event>` inside a component, `on<Event>` for callback props.
* Constants and config objects: `UPPER_SNAKE_CASE`.
* Types and interfaces: `PascalCase`, no `I`/`T` prefix (except props interfaces).
* Enums: `const enum` with `Enum` suffix, values `UPPER_SNAKE_CASE`. Where a spec contract defines a string union (`'open' | 'stream' | 'heavy' | 'rock'` in Part 6 §1), keep the union exactly as specified — the contract wins.
* Domain terms follow the spec glossary (Part 1 §1.3) and engine model (Part 6 §1): `target`, `bomb`, `fence`, `stream`, `bridge`, `heavy`, `rock`, `probe`, `reveal`, `epoch`. Do not invent synonyms.
* No abbreviations except widely accepted ones (`id`, `url`, `api`, `ref`, `props`); acronyms as words: `apiClient`, `wsClient`.

## Stores and queries

* Store hook `use<Scope>Store`; one store per state scope (spec Part 8 §6.1 names: `progressStore`, `gameSessionStore`, `matchStore`, `outboxStore`, `settingsStore`, `authStore`, `editorStore` → `useProgressStore`, …).
* Actions are verbs: `tap`, `setTheme`, `enqueueAttempt`, `reset`.
* Query key factory `<entity>Keys`; options factories `<entity><Scope>QueryOptions` / `<action><Entity>MutationOptions`; hooks `use<Entity>Query` / `use<Action><Entity>Mutation`.
