# 0040. Settings screen

Date: 2026-10-20. Asked by: tail task 1, settings (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Sound and music | Volume 0–100 in steps of 5, 0 = off; the pause sheet switch turns it off and back to the last volume; defaults sound 80, music 0. Values are only stored until sound assets exist (0013). | Part 1 §7.5, design 25.1 |
| 2 | High-contrast board | The row is hidden; a separate task with its palette and patterns. | Part 3 §11.1 |
| 3 | Account | «Статус»: «Гость» or the linked nickname; «Привязать аккаунт» → the link sheet (0019); «Выйти» (linked only) → `POST /auth/logout`, a new silent guest, local progress reset, toast «Ты вышел из аккаунта»; «Удалить аккаунт» — the 26.3–26.4 flow in this task (`DELETE /me` with the nickname, the scheduled screen; cancel by signing in — `POST /me/restore`). Texts «Выйти», «Привязать аккаунт», «Ник не совпадает», «Удалить навсегда» from the design. | Part 1 §7.6, Part 4 §12.2, Part 7 |
| 4 | Libraries | `expo-clipboard`, `expo-store-review`, `expo-application` from the Part 8 stack are installed (dev build rebuild). | Part 8 §2 |
| 5 | Entry | The «Настройки» button of the profile (design 23.1) → nested `/settings` with a back arrow. | design 23.1, 25.1 |
| 6 | Coordinates | A1…G7 around every game board (campaign, daily, live match, «Против карты»), on by default; subtitle «A1…G7 по краям поля». | design 25.1 |
| 7 | PvP tap confirmation | The first tap selects a tile, the second tap on it sends the move, a tap on another tile moves the selection; live and async matches; off by default. | Part 1 §7.5 |
| 8 | Rival skins in PvP | Stored only (no rival skins in a match, 0024 #10). | 0024 #10 |
| 9 | Theme and language | Theme segment light / dark / system (default system, live system switches, NET-13); language RU / EN without a restart, `PATCH /me {locale}` and a refetch of server data (NET-12), toast «Язык: русский» / «Language: English»; the system language until one is chosen. | Part 1 §7.5, Part 11 NET-12, NET-13 |
| 10 | Notifications | The group is hidden until the stage 5 push task. | 0039 #4 |
| 11 | Privacy and help | Hidden until links or SDKs exist: ad settings (UMP), policy, terms, FAQ, events. Shown: «Правила игры» (the rules sheet), «Написать в поддержку» (a sheet like the appeal, topic `support`). | Part 4 §12.1 |
| 12 | About | Version and build, player ID copied by a tap (toast «ID скопирован»), «Оценить игру» (system review), the design footer «RECKON PATH · version (build)» and «Сделано с любовью к сигналам». | design 25.1 |
| 13 | Row icons | SVG icons on the design's coloured tiles instead of the design glyphs. | rule 13 |
| 14 | Out of the task | High contrast, notifications, UMP, FAQ, real sound. | — |
| 15 | After «Удалить навсегда» (round 2) | The session stays: the screen with the date and «Отменить удаление» (`POST /me/restore`); in the settings the «Удалить аккаунт» row shows «Удаление {{date}}» and leads to that screen; leaving is the usual «Выйти». Step 1 lists campaign, currency, collection and arena from local and cached data (friends hidden until stage 5); texts of 26.3–26.4 from the design. | Part 1 §7.6, design 26.3–26.4 |

## Consequences

`useSettingsStore` grows to volumes, coordinates, PvP tap confirmation, rival skins, theme and language (a new version with a migration). The board widget gets coordinates on game boards; the match screens get the tap confirmation.
