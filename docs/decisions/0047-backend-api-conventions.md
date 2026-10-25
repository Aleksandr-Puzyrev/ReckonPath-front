# 0047. The client adopts the backend's API conventions

Date: 2026-10-25. Asked by: clarify-task after the backend audit. Answered by: developer.

Supersedes 0046 #1 and the format, error, and code conventions of spec Part 7 §1–2. The spec text is not edited.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | How the client takes snake_case and the `{success, data}` envelope | The client stays camelCase inside. `shared/api` converts at the boundary: responses are unwrapped and snake → camel, request bodies camel → snake, backend errors become the client's internal error. Types come from `contracts/openapi.yaml`, kept camelCase. The mocks answer in the backend format through the same boundary, so tests run the real conversion path. | Part 7 §1 |
| 2 | Scope | Only the conventions: envelope, error format, casing, error codes, headers, base path. Endpoints and flows the backend lacks or does differently (guest, bootstrap, campaign attempts, `GET /me` fields, login by nickname …) stay separate tasks per entity. | — |
| 3 | Error code catalogue | The backend's codes in lower snake_case. Areas the backend does not have yet (arena, shop, bans, daily …) use the Part 7 §2 names in lower snake_case (`already_owned`, `in_match`, `banned`, `insufficient_funds` …), passed to the backend as the codes to use. | Part 7 §2 |
| 4 | WebSocket | The same conversion at the `shared/ws` boundary; the fake game server speaks the backend style. | Part 7 §8 |
| 5 | Store link | Android: `play_market` and `ru_store`; iOS: `app_store`. One link is shown: on Android the store the app was installed from (`ru_store` when installed from RuStore, otherwise `play_market`) — needs the installer source from native code; applies when the version endpoint is adopted. | Part 7 §3 |
| 6 | Server time | From the standard `Date` response header until the backend sends `X-Server-Time`. The header has whole seconds, so the offset is up to 1 s early (0.5 s on average) — acceptable for countdowns; the live match keeps its own WS clock sync. | Part 7 §1 |
| 7 | Left to the backend | `Idempotency-Key` storage and replay (required: double charges otherwise) and echoing the client's `X-Request-Id` (wanted). The handoff `docs/backend-handoff/api-conventions.md` is reduced to these. | Part 7 §1 |

## Consequences

* `contracts/openapi.yaml` keeps camelCase but its `ErrorCode` enum switches to the lower snake_case catalogue; the client's code comparisons, mocks, and `errors.<code>` i18n keys follow.
* The base URL in the environment includes `/api` (the backend serves `/api/v1`).
* WebSocket error codes (`not_your_turn`, `cell_revealed`, `cell_rock`, `stale_turn`, `match_over`, `in_match`, `already_queued`, `map_invalid`, `banned`) follow #3 as well.
