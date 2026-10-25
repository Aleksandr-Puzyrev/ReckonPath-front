# 0044. Sharing and playing by code (tail task 4b)

Date: 2026-10-23. Asked by: tail task 4b (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Challenge in the code | `x` is the author's best result in moves (an integer), taken from «Сыграть самому» and kept locally per level; «Добавить вызов» is available only with such a result (**to agree with the Go backend**). | Part 6 §7.2, 0008 #4, Part 4 §11.2 |
| 2 | Author in the preview | Not shown: the code format has no author; the preview shows the title, size, targets and elements. | Part 6 §7.2, design 27.6 |
| 3 | Playing a code | Its own screen like «Сыграть самому» but with hidden targets; no rewards, stars or progress. With a challenge, the result panel shows «Твой результат: N ходов · Вызов автора: M ходов» and «Вызов побит!» or «Вызов не побит — попробуй ещё»; «Ещё раз», «К уровням». | Part 1 §7.4 |
| 4 | Code errors | Part 1 §7.4 texts: «Неверный код», «Код из более новой версии — обновите игру», «Уровень не проходит проверку». | Part 1 §7.4, Part 11 LVL-FX6 |
| 5 | Link | `reckonpath://play?c=CODE` (the app.json scheme); it opens «Играть по коду» with the preview; no https link until a domain exists. | Part 1 §7.4 |
| 6 | «Поделиться» (27.5) | In the editor, for a saved valid level: title, size, targets; the `RP2-…` code in a monospaced field with «Скопировать» (toast «Код скопирован»); «ПОДЕЛИТЬСЯ ССЫЛКОЙ» opens the system share sheet with the title, code and link; the «Добавить вызов · мой результат: N ходов» switch. | design 27.5, Part 4 §11.2 |
| 7 | «Играть по коду» (27.6) | From «Уровни»: a code field and «Вставить» (reads the clipboard only on a tap); a valid code shows «Уровень игрока», title, size, targets, elements and «Вызов автора: N ходов»; «ИГРАТЬ»; errors under the field. | design 27.6, Part 4 §11.3 |
| 8 | Texts | Design: «Поделиться уровнем», «Поделиться ссылкой», «Добавить вызов», «мой результат: {{count}} ходов», «Вставить», «Уровень игрока», «Вызов автора»; spec: «Скопировать», «Играть»; approved: «Код скопирован», «Код уровня», «Твой результат: {{count}} ходов», «Вызов побит!», «Вызов не побит — попробуй ещё». | rule 15 |
| 9 | Out of the task | https links and the store redirect (no domain); `PELENG1-` codes already decode. | Part 1 §7.4 |
| 10 | Beating the challenge (round 2) | Only fewer moves than the author beat it; an equal result shows «Вызов не побит — попробуй ещё». | Part 1 §7.4 |
| 11 | Challenge after a loss (round 2) | Shown: «Вызов автора: N ходов» and «Вызов не побит — попробуй ещё» under «Ходы закончились», without the player's result. | Part 1 §7.4 |

## Implementation notes

* The engine decoder returns `challenge` (from `x`, `null` unless a positive whole number) and a new error `LEVEL_INVALID` for a well-formed code whose level fails the validator (it was `CODE_INVALID`); the shared vectors are updated and a challenge vector was built in Python (**to agree with the Go backend**).
* The author's best result is kept per exact level, keyed by its code without the challenge, so any edit drops it.
* «Играть по коду» is the `/play` route (the `reckonpath://play?c=` link lands there); the game is `/play/code`, the tryout screen with hidden targets.
* The code field uses the regular font: there is no monospaced font token.
