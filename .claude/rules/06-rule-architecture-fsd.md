# Architecture and Layers (Feature-Sliced Design)

Source: spec Part 8 §1–§6 (`docs/spec/08-client-architecture.md`), adapted by `docs/decisions/0001-project-setup.md` (single app, kebab-case, Reckon Path naming).

## Stack

The stack is fixed by spec Part 8 §2. Adding a library that is not listed there, or replacing a listed one, requires explicit developer approval. Install packages only with `npx expo install <package>` (SDK-compatible versions). A listed library is installed when the first task needs it, not in advance.

Core: Expo SDK 57 + dev client, new architecture, Hermes, TypeScript strict + React Compiler, Expo Router, Unistyles 3, Reanimated 4 + worklets, Gesture Handler, Skia, TanStack Query v5, Zustand v5 + MMKV, zod v4, react-hook-form, i18next, FlashList v2, `@gorhom/bottom-sheet` v5, `expo-image`.

## Directory layout

```text
src/
  app/            Expo Router routes and _layout files ONLY (thin: default-export a screen + navigation options)
  application/    FSD app layer: providers (Query, Unistyles, i18n, Sentry, Gesture, BottomSheet), bootstrap, guards
  screens/        screen composition from widgets (home, levels, play, arena-home, match, shop, profile…)
  widgets/        board, hud, level-list, match-header, shop-grid, season-track, wallet-bar, tab-bar…
  features/       user actions: tap-cell, flag-cell, place-element, purchase-item, equip-item, claim-reward…
  entities/       level, progress, daily, match, arena-map, user, wallet, item, event, friend, season
                  each: model/ (types, store), api/ (queries, mutations), ui/ (small components)
  shared/         ui (design system), theme, api (http client), ws, storage, i18n, analytics, ads,
                  audio, haptics, config, lib
packages/
  engine/         @reckon-path/engine — pure game logic (see 09-rule-game-engine.md), vectors/
modules/          own Expo modules (yandex-ads, app-integrity) — Swift/Kotlin via Expo Modules API
assets/           fonts, sounds, lottie, rive, images
```

Routes live in `src/app/` (Expo Router gives it precedence); the spec's FSD `app` layer lives in `src/application/` (`docs/decisions/0002-setup-follow-ups.md` #1).

## Import direction

```text
app → application → screens → widgets → features → entities → shared
@reckon-path/engine is importable from entities and above; it imports nothing from src/.
```

* Imports go only downward. Slices of the same layer must not import each other (`features/tap-cell` must not import `features/equip-item`). Shared needs move down a layer.
* Each slice exposes its public API through its `index.ts`; imports from outside the slice go through it — no deep imports into another slice's internals.
* Route files contain only the screen's default export and navigation options: no logic, requests, state, or styles.
* `shared` contains no business logic and imports no other layer.
* Enforced by `eslint-plugin-boundaries` once lint is configured (`17-rule-lint-and-typecheck.md`).

## Architectural principles (spec Part 8 §1.3)

1. **Offline-first for single-player**: campaign, daily, editor never wait for the network; the server confirms afterwards.
2. **Server-authoritative for PvP and economy**: the client does not know the opponent's targets and never changes balances itself.
3. **One source of styles**: all colors and sizes come from tokens (`13-rule-ui-unistyles-tokens.md`).
4. **UI thread for animations** (`14-rule-animations-and-graphics.md`).
5. **Types from contracts**: REST types generated from OpenAPI, WS types from JSON Schema; no hand-written duplicates.

## Native code

`ios/` and `android/` are generated (Continuous Native Generation) — never create or edit them. Native behaviour is configured through `app.json` / `app.config.ts` and config plugins. After adding a library with native code the app needs a new development build.

## Pre-task checklist

1. Clarification done (`05-rule-task-clarification.md`).
2. Identify the layer and slice. Create a new slice only when no existing one fits.
3. Check `shared/ui`, `shared/lib`, and the slice for something reusable before writing new code.
4. Respect the import direction; a sideways import signals code in the wrong layer.
5. No new library without approval.
