# 0011. Levels list and campaign progress (stage 1, task 2)

Date: 2026-10-01. Asked by: levels list (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Worlds: spec (8 worlds, 12–13 levels, «Тихая бухта»…) vs design (4 worlds «Первые шаги», «Течения», «Мины», «Туман», 12/12/16/16) | **Structure and names from the spec**, look (covers, cards) from the design. Subtitles from the «Новое» column of Part 1 §3.1 («новое: забор»); EN names are drafts for review. Covers: the design's 4 gradients for worlds 1–4 in order; worlds 5–8 repeat them until the designer draws theirs. | Part 1 §3.1, design 21.1 |
| 2 | Content (only 5 test levels) | Show the test levels as world 1 for now; the real worlds 1–2 arrive with task (3). | decision 0010 #1, #3 |
| 3 | Design vs spec in look | **The design**: row 66 with a 44 tile, design tile gradients (added as tokens by this decision: done #3ED49B → #1F9C74, current #FFB65D → #FF5D6A), locked row = empty tile at 55% with «Уровень N · description» instead of the name, text description instead of element icons, level sheet with separate rows «Лимит», «3★», «2★», «Лучший» and element chips. | Part 3 §4.5, §7.3, Part 4 §4, design 21.1–21.2 |
| 4 | «Редактор» and «Играть по коду» | Shown **disabled** until their tasks. | Part 4 §4.1, §11 |
| 5 | List component | Approved: `@shopify/flash-list` v2 (Part 8 §2.1, JS only). | Part 8 §2.1 |
| 6 | Current level | The first level, in order, that is not won; none when all are won (then no «К текущему»). Level N+1 opens after any win of N. | Part 1 §3.2 |
| 7 | Worlds unlocking | The next world opens with a win of the last (exam) level of the previous one. Locked worlds are collapsed: grey header with «Пройди мир N, чтобы открыть», not tappable. Locked levels of an open world are shown. | Part 11 LVL-24, design 21.1 |
| 8 | Taps | Won level → level sheet; current level → play at once; locked level → shake + toast «Сначала пройди уровень N», N = the current level. | Part 4 §4.2, design 21.3 |
| 9 | Toast | Shared Toast per Part 3 §7.5: 1.5 s, above the tab bar, one at a time. | Part 3 §7.5 |
| 10 | Scrolling | On open the current level is centred; «К текущему» with an up/down arrow appears while the current row is off screen; returning from play shows the new progress. | Part 4 §4.2, design 21.4 |
| 11 | Level sheet | Mini-board (the same Skia board without gestures and numbers, elements visible), limit, 3★ and 2★ thresholds, best result, element chips, «Играть»; rows without data (no stars, no limit) are hidden. | Part 4 §4.2, design 21.2 |
| 12 | Star total | Denominator = 3 × number of campaign levels (300 for 100 levels); sum of best stars. | Part 1 §3.3 |
| 13 | Texts | Part 5 keys with their EN; missing texts (row description, «МИР n», sheet labels, 3★ world badge) in RU from the design, EN drafts for review. Level names from `title`; none → number only. | Part 5 |
| 14 | Progress store | Still stores only the best result per level; states, current level and totals are derived, so the store version is unchanged. Server sync later. | Part 8 §6.1 |
| 15 | Out of scope | World rewards (◆10 / ◆25), world themes, arena lock before level 12, Home («ПРОДОЛЖИТЬ», «Кампания пройдена»), editor and play by code, tutorial, sync. The current-level selector is shared so Home can reuse it. | — |

## Implementation notes

* A locked level opened by a link (`/play/campaign/<id>`) shows «Сначала пройди уровень N» instead of the game; the check runs once when the screen opens.
* Android Back closes an open sheet (any screen) instead of leaving the screen; a sheet that cannot be dismissed (win, lose) ignores it.
* A locked world header uses `bg.sunken` instead of the design's grayscale filter (iOS has no grayscale filter for views). Worlds without levels yet show no star counter.
* Tokens added by #3: gradients `levelDone`, `levelCurrent`, `perfectBadge`, `world1`–`world4`; `text.onGold` for the 3★ world badge; sizes `levelRow` 66 / 44, `worldHeader` 104 / 96, `chip` 34, `floatingButton` 44.
* The done tile shows an SVG check instead of the design's «✓» character (rule 13: icons are SVG).
* The level sheet's mini-board shows the terrain and fences only: targets, bombs, and buoys stay hidden, as on a fresh board, so the preview does not give the level away (#11 «elements visible» = terrain).
