---
paths:
  - "src/**/api/**"
  - "src/shared/ws/**"
  - "src/application/**"
---

# Data Layer: TanStack Query, REST, WebSocket

Server state belongs exclusively to TanStack Query v5. Source: spec Part 7 (API contract), Part 8 §6 and §9.

## Contract and client

* Types come from the OpenAPI contract via `openapi-typescript`; the client is `openapi-fetch` (Part 8 §2.3, §9.1). Generated code is never edited or duplicated by hand.
* Until the contract file exists in this repository, the agent must not invent endpoints, fields, or error codes: use only what spec Part 7 states, and ask about anything missing.
* The HTTP client lives in `shared/api` with middleware exactly per Part 8 §9.1: headers (`Authorization`, `X-App-Version`, `X-Platform`, `X-Locale`, `X-Request-Id`), single-flight refresh on 401, 426 → update screen, 503 `maintenance` → maintenance screen, 10 s timeout.
* Error codes from responses map to i18n keys `errors.<CODE>`; unknown codes → generic text + Sentry.

## Queries and mutations

* Requests are declared via `queryOptions` / `infiniteQueryOptions` / `mutationOptions` factories; the file exports the factory and the hook using it. Components use the hooks, not inline `useQuery({...})`.
* Keys via a `<entity>Keys` factory; invalidation by prefix of the affected keys only.
* Retries: network and 5xx — 3 times with 1/2/4 s delay; 4xx — no retry (Part 8 §9.1).
* `staleTime` per data type within 30 s – 10 min (Part 8 §6.1); persisted to MMKV for offline display.
* `mutate` with `onSuccess` / `onError` callbacks; `mutateAsync` only for genuinely sequential dependent mutations.
* Writing requests carry an `Idempotency-Key` (UUID v7) created once per user action (Part 8 §6.4).
* Optimistic updates only for equip, flags, and settings. Currency and purchases — only after the server response (Part 8 §1.3, §6.4).
* `onlineManager` wired to NetInfo, `focusManager` to AppState.
* Independent requests run in parallel; `enabled` only for truly dependent requests.

## Offline outbox

Attempts and analytics go through `outboxStore` (Part 1 §9.3, Part 8 §6.4): batched sends on start, on going online, on background, every 60 s while non-empty; idempotent by `attemptId`; 4xx → drop and log; 5xx/network → exponential retry. The server response replaces the local prediction.

## WebSocket (`shared/ws`)

Behaviour exactly per Part 8 §9.2 and Part 7 §8: heartbeat, reconnect backoff, clock-offset sync, `seq` ordering with `match.resync` on gaps, zod validation of every incoming message, background handling. `matchStore` changes state only from server messages; client actions only send messages.

## Boundaries

* Server data is never copied into Zustand or `useState`; derive during render or via `select`.
* PvP: the client never receives or computes the opponent's hidden targets.
