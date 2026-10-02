# 0014. Stage 2 plan: account, progress, data layer

Date: 2026-10-01. Asked by: stage 2 (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Backend | **None yet.** The client is built against the contract; dev builds and tests use msw mocks; switching to the real server is one setting. | Part 7, rule 10 |
| 2 | `contracts/openapi.yaml` | Written by the agent **strictly from Part 7**, endpoint by endpoint as tasks need them; reviewed by the backend. | Part 7 intro |
| 3 | API addresses | **None yet**: dev / staging / prod base URLs stay empty in the environment config; work runs on mocks. Part 7's `api.pelenge.app` is the old product name and is not used. | Part 7 §1 |
| 4 | Task order | (1) data layer: `openapi.yaml` for stage 2, generated types, HTTP client middleware (Part 8 §9.1: headers, refresh on 401, 426 / 503 screens), TanStack Query, msw mocks, `GET /bootstrap`; (2) remote texts (#8); (3) guest sign-in: `POST /auth/guest`, tokens (refresh in SecureStore), `GET /me`; (4) attempts sync: MMKV outbox, `POST /attempts:batch` on start / online / background / every 60 s, merge by max, `corrected` / `late`; (5) daily and streak: `/daily`, engine daily generator, `GET /daily`, `GET /streak`, restore; (6) wallet: balance bar, continue for ◆ (`POST /continue`); (7) Apple / Google sign-in and linking (needs Apple Developer and Google Cloud data). | Part 12 §2 stage 2 |
| 5 | Dependencies (task 1) | Approved: `@tanstack/react-query`, `openapi-typescript` (dev), `openapi-fetch`, `msw` (dev), `@react-native-community/netinfo`, `expo-secure-store`, a UUID v7 generator (`uuidv7`). Dev builds are rebuilt after native ones. | Part 8 §2.3 |
| 6 | `integrityToken` in `POST /auth/guest` | Sent empty with a TODO; the App Attest / Play Integrity module (`modules/app-integrity`) is a later task. To agree with the backend: accepting guest sign-in without the token in dev / staging. | Part 7 §3, Part 8 |
| 7 | Mocks in dev builds | msw mock server in dev builds while there is no server; the same handlers in tests; never in release builds. | rule 16 |
| 8 | **New: remote texts** | Almost every app text can be changed from the admin panel without an app update (to fix typos). Offline or before the first download, the texts bundled in the app are shown. Not in the spec: a separate task right after the data layer, with its own clarification (endpoint proposal for the backend, admin section). | — (developer request) |

## Task 1 (data layer): implementation notes

Date: 2026-10-02. Taken by the agent while implementing the confirmed task 1 under the standing rule "prefer the design for UI"; to be confirmed by the developer.

| # | Topic | Decision | Source |
| --- | --- | --- | --- |
| 9 | System screen texts | Design texts win over Part 5 where they differ: `system.update.body` from design 28.1, `system.maintenance.title` «Техработы» / "Maintenance" (Part 5: «Немного чиним антенну»), `system.update.softTitle` «Вышла версия {{version}}» (28.2), `system.maintenance.checking` / `still` (28.3). The server `version.message` replaces the update body when present (Part 4 §12.4 "текст из админки"); `maintenance.message` comes before «Завершим примерно в {{time}}», time in the device's time zone. | design 28.1–28.3, Part 4 §12.4, Part 5 |
| 10 | «Играть офлайн» | Hides the maintenance screen until the next launch and opens Home (design 28.3 links to Home 19.6 offline); the campaign is reachable from there. | design 28.3, Part 11 NET-04 |
| 11 | «Позже» on the soft update | Hides the sheet for 24 h (the time is persisted in MMKV), so it shows at most once a day. | Part 11 NET-02, design 28.2 |
| 12 | Soft update sheet | No download size (Part 7 does not send it); the feature list is `version.message`. The radar sweep animation of 28.1 / 28.3 is not built (static rings). | design 28.2, Part 7 §3 |
| 13 | Guards | `Stack.Protected` in the root stack: forced update → `system/update`; maintenance → `system/maintenance`; a 426 / 503 `MAINTENANCE` from any request re-reads `/bootstrap`. Forced update wins over maintenance. | Part 8 §7, §9.1 |
| 14 | Cache | TanStack Query cache persisted to MMKV for 24 h, dropped on an app version change; bootstrap `staleTime` 5 min, and every launch re-requests it after the cache is restored (Part 4 §2.1). `@tanstack/query-async-storage-persister` replaces the deprecated sync persister. | Part 8 §6.1 |
| 15 | Idempotency | Writing requests get an `Idempotency-Key` in the middleware unless the action passes its own (actions with retries pass one created per action). | Part 7 §1, Part 8 §6.4 |
| 16 | Not yet used | `config`, `serverTime` (clock offset) and the 401 refresh are wired only where a consumer exists: refresh comes with task 3, config and clock offset with their first consumer (daily, continue price). | — |
| 17 | msw in dev builds | msw is imported through `msw/http` and `msw/utils/get-response` (no WebSocket / SSE modules), with a dev-only polyfill for `MessageEvent` and `Headers.getSetCookie`, which Hermes and React Native's fetch lack. Release builds drop the mocks with the `__DEV__` branch. | rule 16 |
| 18 | `errors.QUEUE_UNAVAILABLE`, `CODE_INVALID`, `CODE_NEWER` | Part 5 texts for client-side cases (matchmaking, level codes); Part 7 §2 has no such server codes, so the server error mapping does not use them. | Part 5, Part 7 §2 |
