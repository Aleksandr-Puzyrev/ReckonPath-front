# 0061. Daily (Пеленг дня) and the streak on the backend

Date: 2026-11-17. Asked by: clarify-task for connecting the daily and the streak to backend `a709480` (`internal/features/daily`, `docs/swagger.yaml`). Answered by: developer.

The rule of 0060 holds: where the backend and the spec or earlier decisions differ, the client follows the backend.

| # | Question | Decision | Supersedes |
| --- | --- | --- | --- |
| 1 | Daily model | A server game like the campaign: `POST /daily/play {restart?}`, `POST /daily/games/{id}/tap {row, col, seq}`, `GET /daily/games/{id}`; the board is drawn from the server state. The daily needs the network: without it the daily shows «Нужна сеть, чтобы играть пеленг дня». The engine does not play the daily in the app any more. Only a win counts; attempts before the first win are unlimited and count for the rank; no continue. | 0017, 0060 #3 and #5 (daily part), Part 1 §4 (attempt rules) |
| 2 | Preview before start | The server sends no board before a game. Before «Играть» the screen shows the title, `rows × cols` and the rewards; the board appears after the start. If a game of the day is already running, its board is shown at once. Sending the board before the start goes to the backend to-do. | design preview of the daily board |
| 3 | After a win | Only the result of the day; no «Ещё раз» (the server answers `daily_done`). | 0026 #16 (replay) |
| 4 | Ads | The ad continue in the daily and the ad streak restore are hidden and their code removed; they come back with the ads. | 0026 #6, 0051 #4 |
| 5 | Engine daily generator | Stays in `packages/engine` as a tool to fill the admin pool; the app no longer calls it. | — |
| 6 | Result and top | No game time, median or «Топ N%»: the server does not send them. The result shows «Место R из P», P is the number of players who won the day. | Part 1 §4 (standing) |
| 7 | Calendar | Won days only: the server history has no losses or restores. | 0017 |
| 8 | Friends tab of the daily top | Later, with the friends task. | — |
| 9 | Streak restore | For ◆ only (`POST /streak/restore {method: "gems"}`); `restorable`, `restore_cost` and `restore_at` come from `GET /streak`. A restore is possible only before today's win (a win starts the streak at 1), so when a restore is available the screen warns before the start. | 0026 #6, Part 1 §4.4 |
| 10 | Streak milestones | Rewards from `StreakView.milestones`; no badges. | Part 1 §4.4 (badges) |
| 11 | Route | `/play/daily/d-YYYY-MM-DD` stays; only today can be played. | — |
| 12 | New texts | `daily.unavailable` «Уровень дня ещё не готов — загляни позже» / "Today’s level isn’t ready yet — check back later"; `daily.dayOver` «День закончился — начни сегодняшний пеленг» / "The day is over — start today’s bearing"; `daily.attempt` «Попытка {{n}} — чем меньше попыток, тем выше место» / "Attempt {{n}} — fewer attempts rank higher"; `daily.restoreFirst` «Сначала восстанови серию — после победы она начнётся заново» / "Restore your streak first — a win starts it over"; `daily.place` «Место {{rank}} из {{total}}» / "Place {{rank}} of {{total}}"; `daily.network` «Нужна сеть, чтобы играть пеленг дня» / "You need a connection to play the daily bearing". | — |

## Consequences

* `contracts/openapi.yaml` gets the backend's daily and streak paths and schemas; `/attempts:batch`, `/progress` and the old daily and streak shapes are removed.
* The local attempt queue (outbox, finish-attempt, sync-attempts, the daily record store, the week prefetch) is removed: nothing uses it any more.
* `docs/backend-handoff/backend-todo.md` gets the board before the start; `frontend-answers.md` §5 is rewritten to match this decision.
