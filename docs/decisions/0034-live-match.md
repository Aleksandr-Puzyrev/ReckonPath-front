# 0034. Live match screen

Date: 2026-10-19. Asked by: stage 4 tasks 5–6 (clarify-task, round 2). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | After `match.end` | Until task 7, an end overlay on the match screen: «ПОБЕДА / ПОРАЖЕНИЕ / НИЧЬЯ» (`result.pvp.*`), the reason (`result.pvp.reason.*`), both maps revealed, ±trophies, «На арену». Task 7 replaces it with the result screen. | Part 4 §8.6 |
| 2 | Emotes | By order of design 16.9: nice — «Хорош!», wow — «Ого!», oops — «Упс», luck — «Удачи», echo — «GG», thanks — «Спасибо»; EN from the design. | design 16.9, 0029 #4 |
| 3 | Layout | Opponent bar on top (avatar with the timer ring, nickname, «сигналы N/M», connection icon) with my mini map and his taps on the right; the turn banner and the opponent's board full width; «Ход N / 40» under it; my bar at the bottom («найдено N/M», «× bombs»), «Эмоции», «Флажок», «Меню»; colours `player.me` / `player.opponent`. | Part 4 §8.5, design 16.1 |
| 4 | Banner and toast texts | Part 5 where it exists (`match.yourTurn`, `match.timeout`, `match.timeoutWarn`, `match.reconnecting`, `match.oppReconnecting`, `match.finalTurn`, `match.turn`, `match.found`); the rest from the design: «ТВОЙ ХОД · N С», «ХОД СОПЕРНИКА», «ТЫ ПРОПУСКАЕШЬ ХОД — БОМБА», «ФИНАЛЬНЫЙ ХОД СОПЕРНИКА», «Бомба! Ты пропускаешь следующий ход», «Соперник на твоей бомбе — пропустит ход», «Соперник нашёл твою цель», «Соперник пропускает ход — ходи ещё»; about the opponent without past tense (Part 5 rule): «Все цели соперника найдены — твой финальный ход». | Part 5 §4, design 16.x |
| 5 | Opponent board | The layout without targets and bombs; my answers (bearing, target, bomb, «bomb near») drawn from server results only; my taps outlined in `player.me`, a pending tap pulses; flags in any turn (flag mode or long press), the default skin (0024 #10). | Part 3 §6, PVP-28 |
| 6 | Timer and haptics | A ring around the current player's avatar from the server `deadline` with the clock offset (NET-07); the last 2 s red with `impactLight` each second; my turn `impactLight`, opponent found my target `impactMedium`, opponent on my bomb `notificationSuccess`, my bomb `impactHeavy`, timeout `notificationWarning`; no sounds until audio exists. | Part 1 §5.4, Part 3 §9 |
| 7 | Menu | «Сдаться» with «Сдаться? Ты потеряешь N кубков» from the engine formula (bot ×0.5, PVP-15); «Заглушить эмоции соперника» for the match; no «Звук» until audio; Android back opens the surrender dialog, the timer runs (PVP-21). | Part 4 §8.5, PVP-21 |
| 8 | Connection | My drop — the full-screen «Восстанавливаем связь…» with a seconds counter; the opponent's drop — a wifi-off icon by his avatar (icon added); a snapshot restores the screen (NET-11); a lost match (30 s) — a toast and back to the arena. | Part 4 §8.5, NET-11, PVP-16 |
| 9 | Keep awake | `expo-keep-awake` installed with this task (0028 #8); the dev build must be rebuilt. | Part 8 §2.4 |
| 10 | Route | `arena/match/[id]`, full screen, no swipe back, no tab bar. | Part 8 §7 |

## Implementation notes (tasks 5–6)

* `matchStore` is a pure reducer (`receiveMatchMessage`) wrapped in Zustand; `matchSession` (entities/match) binds it to `ws` outside React, connects to the match node on `match.found`, stops the search when the app goes to the background and marks a lost match.
* `ws`: messages sent while (re)connecting are queued until the socket opens; `connectMatch(endpoint, null)` returns to a running match (`?resume=1`); `onStatus` drives the «Восстанавливаем связь…» overlay.
* The search start (link offer, no-map dialog, random map → save → activate → search) is composed in `screens/arena-home`. The account store (v3) gets the `arena` offer and a `declined` event: «Позже» continues the search.
* Motion tokens: `radarTurn` 2600 ms (design 15.1 radar) and `versusHold` 1200 ms — the pause on «Первым ходит» before the match (not in the spec or design).
* Part 5 wins over the design: `match.theySkip` «Ловушка сработала! Ходи ещё раз»; «Соперник нашёл твою цель» is worded without past tense: «Цель на твоей карте найдена».
* The opponent's board on his turn uses the existing `dim` tint, not the 25% of Part 4 §8.5.
* The end overlay shows `surrender` / `afk` reasons only for a win (Part 5 words them from the winner's side).
* The surrender loss uses the engine formula with a zero floor (the season floor is not known on the client).
* Search failures (`MAP_INVALID`, network) toast on the search screen right before it closes, so the toast may be cut short.
* `expo-keep-awake` is installed: the dev build must be rebuilt.
