# 0029. Arena contract and data layer

Date: 2026-10-17. Asked by: stage 4 task 1 (clarify-task). Answered by: developer.

Points 2–4 are proposals **to agree with the backend** (0028 #1).

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | JSON Schema → zod | Dev dependency `json-schema-to-zod` (approved; not in the Part 8 stack) with a `ws:generate` script, like `api:generate`; `contracts/ws/*.schema.json` stay the source of truth. | Part 8 §1.3, §9.2 |
| 2 | `match.snapshot` | Everything needed to restore the match after a restart (NET-11): the opponent map without targets and bombs, the opponent's bomb count, the opponent (as in `match.found`) and the format, both players' taps with results, found targets, timeouts in a row, skips, the final-turn flag, the current player and the deadline. | Part 7 §8.2, Part 11 NET-11 |
| 3 | Match details in history | The list row fields + both maps in full + every tap `{ turn, player, cell, outcome, value }`. | Part 7 §5 |
| 4 | Enums | Match mode `ranked`, `bot`, `async`, `training`, `friendly` (engine `MatchKind` + `training`); result `win`, `loss`, `draw`, `annulled`; reason `targets`, `surrender`, `afk`, `turnLimit`, `annulled` (Part 5 keys); season track step state `claimed`, `available`, `locked`; tap outcome `pelang`, `target`, `bomb`; emotes `nice`, `wow`, `oops`, `luck`, `thanks`, `echo` (design 16.9 phrases; Part 7 shows `gg`). | Part 5 §4, Part 7 §5, §8, design 16.9 |
| 5 | Maps | Level v2 without `moveLimit` (`$ref` to `level.schema.json`); the opponent map in a match is a separate layout schema without targets and bombs, its size comes from the format. | Part 7 §5, §8 |
| 6 | Format limits | The server sends singular keys (`fence`, `bomb`); the client maps them to the engine's plural `PvpFormat` keys. | Part 7 §5, engine `PvpFormat` |
| 7 | Mocks in this task | `GET /arena`: open after level 12 by the mock server's progress; Bronze profile, 0 trophies. Maps: create, update, delete, activate, validate (engine `validateLevel`), random (engine `generateRandomPvpMap`). «Против карты», history and season mocks come with tasks 8, 3 and 10. | 0028 #6 |
| 8 | Leaderboards | `GET /leaderboards` is not added (stage 5). | 0028 #5 |
| 9 | Entities | `entities/arena` (profile, format, season), `entities/arena-map` (map queries and mutations), `entities/match` (history and WebSocket message types). | Part 8 §5.2 |

## Consequences

Task 1 adds the arena REST paths to `contracts/openapi.yaml`, `contracts/ws/*.schema.json` with generated zod, the `ws:generate` script, mocks for the arena profile and maps, and the three entities.

## Round 2 — implementation (2026-10-17)

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 10 | Mocks need the engine, but `shared` must not import it (rule 06) | `src/shared/api/mocks/**` may import `@reckon-path/engine`: the mocks play the server, which runs the same engine. A separate `mocks` element in `eslint-plugin-boundaries`; the rest of `shared` stays engine-free. Rule 06 updated. | 0029 #7, rule 06 |
| 11 | Bot norm of a saved PvP map | The engine exports `PVP_SOLVER_BOMB_PENALTY`, so the norm is computed with the PvP bomb penalty, as in `generateRandomPvpMap`. | Part 6 §6.3 |
| 12 | Deleting the active map | 409 with code `MAP_ACTIVE` — a proposal **to agree with the backend** (Part 7 §5 names only the status). No Part 5 text: the generic error is shown. | Part 7 §2, §5 |

## Implementation notes

* Proposals **to agree with the backend**: WS error codes `NOT_YOUR_TURN`, `CELL_REVEALED`, `CELL_ROCK`, `STALE_TURN`, `MATCH_OVER` (plus the REST codes `IN_MATCH`, `ALREADY_QUEUED`, `MAP_INVALID`, `BANNED`); `duplicate: boolean` in the season claim answer.
* Fences are a `Fence` tuple schema (`[Cell, Cell]`).
* `openapi-fetch` turns response tuples into `number[][]`; responses with maps are cast to the contract types in the entities.
* The mocks know only the player's format (Bronze, 5×5); another format answers `VALIDATION`. The random map uses a mock median norm (the real one comes from remote config). The season track of `GET /arena` stays empty until the arena home (task 3).
