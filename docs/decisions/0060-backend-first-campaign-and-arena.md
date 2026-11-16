# 0060. The backend first: campaign and arena follow the backend

Date: 2026-11-09. Asked by: clarify-task after the bb3f885 campaign and arena audit (`docs/backend-discrepancies.md` K1–K41, R1–R39). Answered by: developer.

The developer's rule: where the backend (`../reckon-path-backend`, bb3f885, its guide `docs/FRONTEND.md`) and the spec or earlier decisions differ, the client follows the backend. The client adapts in one MR; what the client cannot work around goes to the backend to-do list (`docs/backend-handoff/backend-todo.md`).

| # | Question | Decision | Supersedes |
| --- | --- | --- | --- |
| 1 | Guest | No guest mode at this stage: first launch → language → sign-in or sign-up (design 1.3–1.4) → home; without an account the app does not open; after sign-out — the sign-in screen. The guest code stays but is switched off. | 0015, 0019 #7, 0050 #8–9, 0051 |
| 2 | Campaign model | Server games: `POST /campaign/levels/{n}/play`, a tap is `POST /campaign/games/{id}/tap {row, col, seq}`, the board is drawn from the server state (`cells`, `game`). Worlds, levels, stars, current level, unlocks, rewards come from `GET /campaign` and `GET /campaign/levels/{n}`. A player sees the levels the server has. | 0016, 0039 #2, Part 1 §9.3, Part 8 §1.3 |
| 3 | Offline | No offline campaign at this stage: without a network the campaign shows «нужна сеть»; offline packs (`/campaign/offline/*`) and their encryption are not built. A network loss during a game: «нет связи · Повторить», the game waits. Daily (Пеленг дня) stays local on the engine, as today. | 0046, 0018 #1 |
| 4 | Continue | Online only, for ◆ via `POST /campaign/games/{id}/continue`, the price from `result.continue_cost`. The ad continue is hidden while the backend answers it with `continue_method`. | 0018, 0026 (campaign part) |
| 5 | Daily | Stays local; opens by `unlocks.daily` from `GET /campaign`. | 0007 (unlock source) |
| 6 | Server texts and colours | World and level names are shown as the server sends them; world colours `color_from/to` are server data, like skins. | 13-rule tokens, for server content only |
| 7 | Tutorials and rule cards | Keys the backend knows (`tut_*`, level elements `course`, `hot_cold`, `multi_target`, …) go to `POST /campaign/tutorials` and come back in `GET /campaign`; the rest (`flags`, `distance`, moves hint, home tour, arena editor tutorial) stay local until the backend stores client keys (backend to-do). Device settings, ad counters, drafts and tryout bests stay local by design. | — |
| 8 | Arena protocol | The backend's: the WebSocket `/arena/ws` only pushes `{type, time, match | queue}`; every action is REST (`/arena/queue`, `/arena/matches/{id}/map|ready|tap|surrender`, `/arena/map-match`). The fake game server, `contracts/ws`, the WS schema generator, emotes, reconnect and annulment states, «match on another device», the training match and the PvP formulas of the engine are removed. | 0029, 0030, 0033 #3–4, #9–10, 0034 #2, #7–8, 0035 #1–2, #4, 0036, 0037 #1–2, #6–8 |
| 9 | Arena rules | The backend's: leagues, divisions and formats from the server (6×6…9×9, rectangular `rows × cols` allowed), Elo trophies with `surrender_loss` from the server, timeouts counted over the match, `max_turns` for both players, the final turn as the backend gives it, rewards and RP as the server sends them, «против карты» with one deadline and the server norm. | Part 1 §5, Part 6 §5.1–5.4 |
| 10 | Prepare phase | Built from existing pieces without a design: a timer, «Твоя карта» (saved / random / draw in the editor), «соперник готов», «Готов», «Сдаться». Texts are approved in the plan. | — |
| 11 | Mocks-only mode | Tests use REST mocks with match states and an injected event source; in a dev build without a backend URL the arena shows «арена доступна только с сервером». | 0048 #1 (arena part) |
| 12 | Arena onboarding | Rule cards + `PUT /arena/rules-seen`; the training match is removed; the editor tutorial stays local with a template that fits the league format. | 0037 |
| 13 | Maps | The editor and the board keep the engine model; a converter at the API boundary turns it into the backend level (`terrain` strings, bridge `b`, cells `[r, c]`). 3 maps in total. Live check in the editor by the format caps, the final one by `POST /arena/maps/check`; problem texts are the client's by `code`. | 0032 |
| 14 | Arena ban | From `flags.bans` of `GET /me` and from 403 `banned` on actions. | 0058 #9, 0038 #6 |
| 15 | Rectangular boards | Everywhere (campaign, arena formats and editor, previews): `rows × cols`, not a square `size`. | — |
| 16 | Out of this MR | Leaderboards, another player's profile, profile statistics, country (only the «Страна» leaderboard needs it), offline packs. | — |
| 17 | Content for the backend | A script in this repository exports `packages/content` levels to the backend level format for the admin import. | — |

## Consequences

* `contracts/openapi.yaml` gets the backend's campaign and arena paths and schemas; `/attempts:batch` and `/progress` stay only for daily if needed.
* The spec parts superseded above are not edited; this decision overrides them.
* `docs/backend-handoff/backend-todo.md` lists what only the backend can fix; `docs/backend-handoff/frontend-answers.md` is rewritten to match this decision.
