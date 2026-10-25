# 0043. Level editor (tail task 4a)

Date: 2026-10-23. Asked by: tail task 4, level editor and play by code (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Split | 4a: «Мои уровни», «Новый уровень», the editor screen, «Сыграть самому», saving. 4b (own round): «Поделиться», «Играть по коду», the deep link, the author's challenge. | Part 4 §11.2–11.3 |
| 2 | Editor elements | The arena tools plus «Маяк» and «Буй»; level parameters: probe mode, fog, target order, «Рядом бомба», move limit, title; limits by Part 1 §2.5 / §2.7 and the feature validator (beacons ≤ 3, buoys ≤ 2). | Part 1 §7.4, Part 6 |
| 3 | Editor screen (no design) | The arena editor layout (14.x) plus a «Название» field and a «Лимит ходов» stepper with the hint «бот решает за ~N»; «Сыграть самому» and «Сохранить» («Поделиться» in 4b). | Part 4 §11.2 |
| 4 | Move limit | Default: the bot estimate + 50 %; a limit below the bot estimate only warns (the + 20 % rule of Part 1 §2.7 #8 is the campaign CI check). | Part 1 §7.4, §2.7 |
| 5 | Saving and offline | As arena maps (0032): saving to the server needs the network; edits live in a local MMKV draft with history. | 0032 |
| 6 | «Мои уровни» (27.4) | Opened by «Редактор» in «Уровни»; a row shows the preview, title, size and date; deleting asks «Код уровня перестанет работать у всех, кому ты его отправил.»; up to 20 levels, `LIMIT_REACHED` → a toast. | design 27.4, Part 7 |
| 7 | «Новый уровень» (27.4) | A sheet: rows and columns 4–9, the probe mode, «СОЗДАТЬ». | design 27.4 |
| 8 | «Сыграть самому» | The play screen in a `custom` mode: targets half-transparent, the real move limit, no rewards, stars, progress or attempts to the server; back to the editor afterwards. | Part 1 §7.4 |
| 9 | Texts | Spec and design wording where it exists; the rest proposed as a list for approval before the implementation. | rule 15 |
| 10 | Out of 4a | «Поделиться», «Играть по коду», the deep link, the author's challenge (4b). | — |

## Implementation notes

* «Сыграть самому» is its own light screen (`/editor/tryout`) with a local game instead of the shared play screen: the play screen keeps one saved game in `gameSessionStore`, and a tryout there would overwrite an unfinished campaign attempt. The behaviour of #8 is kept (half-transparent targets, the real limit, no rewards, back to the editor).
* Fog is a switch with the minimum radius (`FOG_MIN`); beacon and buoy refusals on rocks or hidden tiles only shake the tile (no new texts).
* The editor's header, tool tile and status line moved from the arena map screen to `widgets/editor-kit`; `cellsRange` moved to `shared/lib`.
* The text list of #9 was approved by the developer (2026-10-23); the invalid-level line uses the Part 1 §7.4 wording «Уровень не проходит проверку».
* A new level defaults to 6×6 (the middle of 4–9); the design sheet gives no default.
* A saved level that no longer passes the engine's level schema is left out of «Мои уровни».
