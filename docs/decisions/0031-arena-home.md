# 0031. Arena home

Date: 2026-10-18. Asked by: stage 4 task 3 (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Texts missing from Part 5 | RU and EN from the design (13.1, 13.3, 13.4, 13.6, 32.4): stat labels, season and division progress, «Нужен интернет», «Изменить», «Сменить», «Мои карты», «· активная», «черновик — карта невалидна», «Сезонный трек», «RP», «Закрыто», «История матчей», history rows, the locked screen and its three cards, the offline banner, «Изменить в редакторе». Part 5 wins where it differs: `arena.defended` «Защита: N», `arena.locked` without the tail, the turn time from the format (0028 #7). | Part 5 §4, design 13.x |
| 2 | Season track in the mock | 30 steps of 50 RP (engine `trackStep`, Part 7 §5); rewards cycle the design's currency rewards ● 200, ◆ 10, ● 400, ◆ 20; no item rewards (none in the mock catalog). «Забрать» calls `POST /arena/season/claim`, updates the balance and marks the step ✓. | Part 7 §5, design 13.1 |
| 3 | Buttons of later tasks | «В бой» (task 5), «Против карты» (task 8), «Изменить» and «Изменить в редакторе» (task 4) are shown and inactive until their task wires them. | 0028 #6 |
| 4 | No active map | «Моя карта» shows «Карты пока нет» with «Собрать карту» (to the editor, wired in task 4). | ARN-03 |
| 5 | No matches | The «История матчей» block is hidden. | — |
| 6 | «Сменить карту» (13.6) | A bottom sheet with up to 3 maps of the format: mini preview with targets and bombs, name, «Бот решает за ~N ходов» or «черновик — карта невалидна»; a tap on a valid map activates it, a draft cannot be chosen. | Part 4 §8.1, design 13.6 |
| 7 | Match details (32.4) | Route `arena/history/[id]`: header (opponent, result, ±trophies, date, format, turns «9 : 8») and both maps with taps; no replay and no move log (0028 #5). | design 32.4 |
| 8 | Lock | Decided by the local campaign progress (as the daily), offline too; progress «N / 12» from it. The tab bar is unchanged. | Part 4 §8.1, ARN-01 |
| 9 | League emblem | A circle in the `league.*` token colour (Part 3, added to the theme) with the division numeral. | Part 3 §2, design 13.1 |
| 10 | Division progress | «trophies / division top → next division»; from division I the next is the lowest division of the next league; Master shows trophies only. | design 13.1 |
| 11 | Offline (13.4) | Banner «Нет сети · данные от {time}», cached data; «В бой» inactive with «Нужен интернет»; «Забрать», «Сменить» and choosing a map inactive. | Part 1 §8.2, design 13.4 |
| 12 | Common states | Skeleton shaped like the screen; error with «Повторить» and the technical code; «Сезон NN · ещё N дн.» by server time. | Part 1 §8.2 |
| 13 | Out of task 3 | The «Сохрани прогресс» sheet (13.5, task 5), rule cards on the first visit (13.2, task 9), the «Лидеры» block (hidden, stage 5), the ban screen and the season summary (task 10). | 0028 #5, #6 |

## Consequences

`screens/arena-home` replaces the placeholder; `league.*` colour tokens enter the theme; the mock gets the season track and the claim endpoint; a match details screen is added under `arena/history/[id]`.

## Implementation notes

* The contract types the season reward (`SeasonReward`: `currency` coin / emerald, `amount`, `item`) as in the Part 7 §5 examples; the claim answer uses it too. Claiming a locked step answers `VALIDATION`.
* `hero.arena` (Part 3) has no angle; the gradient takes hero.home's 145°.
* Texts beyond the design: «Карты пока нет» / «No map yet», «Собрать карту» / «Build a map» (#4), the accessibility label «Получено» / «Claimed» of a claimed step; the claim button uses Part 5 `season.claim`. «Бот решает за ~N ходов» and the history lines use plural forms.
* The engine also exports `RP_PER_TRACK_STEP` and `TRACK_STEPS` (the mock track).
* `useServerMinute` moved from the shop screen to `entities/app-config`, shared by the shop and the arena.
* The error state shows the response code under «Повторить» as data (no Part 5 text).
* A lock icon (`assets/icons/arena/lock.svg`) for the locked arena.
