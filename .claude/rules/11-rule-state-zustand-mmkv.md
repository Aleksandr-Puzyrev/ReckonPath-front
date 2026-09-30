---
paths:
  - "src/**/model/**"
  - "src/**/*-store.ts"
  - "src/shared/storage/**"
---

# Client State: Zustand + MMKV

Where state lives is fixed by spec Part 8 §6.1. Server data stays in TanStack Query (`10-rule-data-layer-tanstack-query.md`).

| Data | Owner | Persistence |
| --- | --- | --- |
| Profile, wallet, inventory, arena, leaderboards, friends, catalog, events | TanStack Query | MMKV persister |
| Campaign progress (stars, current level) | `useProgressStore` | MMKV; sync with server by max stars |
| Current game (level / daily / code) | `useGameSessionStore` over the engine reducer | MMKV (resume) |
| Current match | `useMatchStore`, updated only by WS messages | none |
| Outbox (attempts, analytics) | `useOutboxStore` | MMKV |
| Settings (sound, theme, language, coordinates) | `useSettingsStore` | MMKV |
| Session | `useAuthStore` (access token in memory) | refresh token in `expo-secure-store` |
| Editor drafts | `useEditorStore` (undo/redo) | MMKV |
| Form state | react-hook-form | none |
| Single-component UI state | `useState` | none |

## Store design

* One store per state scope; stores live in the owning entity's `model/`.
* A store holding game state only stores the engine's state and calls engine functions; it contains no game rules itself. Side effects (sound, haptics, analytics, animations) are dispatched from the engine's returned events (Part 8 §6.2).
* Actions are verbs; stores with resettable state provide `reset`.
* Selectors with `useShallow`; components subscribe to the minimum slice (Part 8 §13: a cell tap must not re-render the screen tree, only the HUD).
* `useMatchStore` is an explicit state machine (`idle → searching → found → intro → myTurn | opponentTurn → finalTurn → ended`, flags `reconnecting`, `pendingTap`; Part 8 §6.3).
* Tokens are never stored in MMKV — refresh token only in SecureStore.

## Persistence

* Every persisted store declares `version` and a `migrate` function; changing a persisted shape without bumping `version` and migrating is a bug.
* Stores are covered by unit tests: actions, `reset`, migrations (`16-rule-testing.md`).
