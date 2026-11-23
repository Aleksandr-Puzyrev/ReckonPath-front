# 0063. My levels (custom levels) on the backend

Date: 2026-11-22. Asked by: clarify-task for connecting «Мои уровни» to the backend (`internal/features/custom`, unchanged between `a709480` and `283c87e`; Part 1 §7.4, Part 4 §11.2, design 27.4–27.6, decisions 0043, 0044). Answered by: developer.

The rule of 0060 holds: where the backend and the spec, design or earlier decisions differ, the client follows the backend.

| # | Question | Decision | Supersedes |
| --- | --- | --- | --- |
| 1 | Contract | The backend's: `GET /levels/custom` → `{levels, max}` (newest first), `POST` / `PUT /levels/custom/{id}` with `{title, level}` (title beside the level, `level` in the backend format through `levelToBackend`), `GET /levels/custom/{id}`, `DELETE`. Errors: 409 `limit_reached {max}`, 422 `level_invalid {problems}`, 422 `validation_failed`, 404 `level_not_found`. | Part 7 §4, `frontend-answers.md` §9 |
| 2 | Stars on save | `stars = [limit, limit]` when a move limit is set, `[0, 0]` without one; custom levels have no stars (0043 #8). | — |
| 3 | Element caps | The editor follows the backend editor caps: fences 16, streams 12, bridges 3, heavy 8, rocks 20, targets 5, bombs 5, beacons 3, buoys 2 (plus the backend's rock share and bomb density rules), with live counters like the arena editor. | Part 1 §7.4 («без лимитов формата»), the client's own soft caps |
| 4 | Bridge | A bridge needs a neighbouring stream cell, as on the backend; the client check uses the existing `map.err.bridge` text. | engine rule (bridge on any stream cell) |
| 5 | Delete confirmation | `editor.list.deleteBody` «Уровень пропадёт из «Моих уровней». Коды, которые ты уже отправил, продолжат работать.» / "The level will be removed from My levels. Codes you’ve already shared will keep working." | design 27.4, 0043 #6 text |
| 6 | Guest link gate | Removed from the editor (no guest, 0060 #1). | 0051 #5 |
| 7 | At the limit | With `max` levels «Новый уровень» shows the toast `editor.limitReached` and does not open the sheet; `max` comes from the server. | 0043 #6 (fixed 20) |
| 8 | Level deleted elsewhere | 404 on save → toast `editor.deletedElsewhere`; the next «Сохранить» saves the draft as a new level. | — |
| 9 | Empty title | Allowed (the backend allows it); the list shows `editor.list.untitled`. | — |
| 10 | Server problems | `level_invalid` problems are shown in the editor status line by `code`, like the arena (0060 #13). | — |
| 11 | Opening a saved level | From the list cache; `GET /levels/custom/{id}` only for a draft restored after a restart whose id is not in the list. | — |
| 12 | Sign-out | Clears the editor draft and the tryout bests. | 0060 #7 (draft kept on the device) |
| 13 | Two devices | Last write wins, no warning (the backend has no versions). | — |
| 14 | Codes | Unchanged: local `RP2-…`, shared only for a saved level without unsaved changes. | — |
| 15 | Old mock data | The dev mock levels and a draft with a mock id are dropped without migration. | — |
| 16 | New texts | `editor.list.hint` «Удалить — кнопкой в строке. До {{max}} уровней.» / "Delete with the button in a row. Up to {{max}} levels."; `editor.limitReached` «Уже {{max}} уровней — удали один, чтобы сохранить новый» / "You already have {{max}} levels — delete one to save a new one"; `editor.list.untitled` «Без названия» / "Untitled"; `editor.deletedElsewhere` «Уровень удалён на другом устройстве — сохрани его как новый» / "This level was deleted on another device — save it as a new one"; `errors.level_invalid` «Уровень не проходит проверку» / "The level fails the check"; `errors.level_not_found` «Уровень не найден» / "Level not found". | — |

## Consequences

* `contracts/openapi.yaml` gets the backend's custom level paths and schemas; the routes go to `BACKEND_ROUTES`; the mocks follow the backend.
* `docs/backend-discrepancies.md` gets the custom level mismatches; `frontend-answers.md` §9 is updated.
