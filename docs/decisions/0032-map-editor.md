# 0032. Map editor

Date: 2026-10-18. Asked by: stage 4 task 4 (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Saving an invalid map | Allowed as a draft («СОХРАНИТЬ ЧЕРНОВИК»); a draft cannot become active. Supersedes E4-1 «Save only when valid». | Part 4 §8.2, ARN-16, design 14.2 |
| 2 | Saving a valid map | Saving also activates it (`activate`), toast «Карта сохранена и активна»; a draft gets «Сохранено как черновик — активной станет после исправления» (design texts). | design 14.1 |
| 3 | Creating the 2nd and 3rd map | A «+ Новая карта» / «New map» row in the «Сменить» sheet while the format has fewer than 3 maps; a new map is named «Карта N» / «Map N», N the first free number. | Part 1 §5.2 |
| 4 | Conflicts on a tile | Terrain (stream / ×2 / rock) replaces terrain, a bridge leaves with its stream; target or bomb on a rock, rock on a target or bomb, bomb on a target and target on a bomb are refused, the map unchanged, with «Цель не ставится на скалу» / «Targets can’t go on rocks», «Бомба не ставится на скалу» / «Bombs can’t go on rocks», «Скалу нельзя поставить на цель или бомбу» / «Rocks can’t cover a target or a bomb», «Бомба и цель не могут быть на одной клетке» / «A bomb and a target can’t share a tile»; a bridge off a stream — `map.err.bridge`. | ARN-17 |
| 5 | Element limits | At the limit the tile looks inactive but stays selectable (to remove with the same tool); placing one more is refused with a counter flash and the toast `map.err.limit` «Лимит: N»; the bomb limit follows the passable tiles (min(5, ⌊passable / 12⌋) and the format). | Part 1 §2.5, §5.2, E4-1, ARN-14, ARN-15 |
| 6 | Status line | Part 5 texts: «Карта в порядке · Бот решает за ~N ходов»; «Клетки D5–E6 отрезаны заборами или скалами» (cell range as in the design), «Нужно N цели», «Лимит: N», «Мост ставится на ручей»; `TRIVIAL` — «Слишком простая карта: бот решает за N ходов» / «Too easy: the bot solves it in N moves». The norm is computed by the engine locally (PvP bomb penalty); error cells are highlighted. | Part 5 §4, Part 6 §6.1 |
| 7 | «Проверить карту» (14.3) | The bot solves the map on the board step by step over about 5 s: «Бот решает… ход N», then «Бот нашёл N цели за M ходов» (design texts). | Part 4 §8.2, design 14.3 |
| 8 | Gestures | Tap a tile to place / remove; stream, rock and erase paint by dragging; a fence by a tap on an edge (12 pt zone) or a swipe along edges, a repeated tap removes it; coordinates A–E / 1–5 outside the board; the board in the player's skin. | Part 4 §8.2, Part 8 §8.2 |
| 9 | History and draft | Undo / redo of 30 steps; unsaved edits live in `editorStore` persisted in MMKV and come back when the same map is reopened; «Не сохранять» drops the draft. | Part 8 §6.1 |
| 10 | Network | Editing and checking work offline; «Сохранить» and RANDOM are inactive offline with «Нужен интернет»; RANDOM goes to `/arena/maps/random` (the median comes from the server); «Заменить карту случайной?» only for a non-empty map. | Part 1 §1.3, Part 7 §5 |
| 11 | Renaming | A tap on the name opens a dialog with a text field, 1–20 characters, «Сохранить / Отмена». | Part 4 §8.2 |
| 12 | Server errors on save | `MAP_INVALID` — saved as a draft with its toast; `LIMIT_REACHED` — «Можно хранить до 3 карт формата» / «Up to 3 maps per format»; anything else — the generic text. | Part 7 §5 |
| 13 | Entry points | «Изменить», «Собрать карту», «Изменить в редакторе» and «+ Новая карта» open `arena/map/[id]` (`new` for a new map). | Part 8 §5.2 |
| 14 | Out of task 4 | The editor tutorial (30.2, task 9); choosing a map before a fight (ARN-03, task 5). | 0028 #6 |

## Consequences

`screens/arena-map` and the `arena/map/[id]` route; the board widget gets an editor mode (tile tap, drag painting, edge hit-test 12 pt); `editorStore` with a 30-step history persisted in MMKV; the arena home buttons of the editor are wired.

## Implementation notes

* The mock server now also checks `TRIVIAL` (bot norm ≥ 3, Part 6 §6.1) like the real validator; test maps were switched to non-trivial ones. Many simple Bronze 5×5 maps with one target are «too easy».
* A gesture is one pan: the first visited tile or edge acts as a tap (toggle), the next ones paint — tiles only for stream, rock and erase, edges add fences.
* Error tiles get a ring in the skin's mine-badge red; coordinates are drawn outside the board.
* The palette tiles show the tool name and the counter, without the design's glyph swatches.
* Texts beyond the design: the rename dialog title «Название карты» / «Map name», the undo / redo labels «Отменить» / «Вернуть» (Undo / Redo); the status line joins Part 5 `map.valid` with the bot estimate as one plural key.
* `Dialog` takes `children` (the rename field). Undo / redo icons added.
* Leaving the editor (no changes, «Не сохранять», or after saving from the exit dialog) clears the draft; it survives an app restart. The editor route has no swipe-back; Android back runs the exit flow.
* `pvpFormatOf` moved to `entities/arena-map`, next to the editor model; `NEW_MAP_ID` lives there too.

## Round 2 (2026-10-19)

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 15 | Screen reader on the editor board | Postponed: finish the arena screens first; the editor board gets the Pressable overlay later. | rule 15 |
