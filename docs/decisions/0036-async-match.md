# 0036. Async match «Против карты»

Date: 2026-10-19. Asked by: stage 4 task 8 (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Surrender | `POST /arena/async/{id}/surrender` is proposed (**to agree with the backend**); «Сдаться» works as in the live match; the mock ends the match as a loss at once. | design 16.12, Part 7 §5 |
| 2 | Coins | ● 20 for a win (×0.5, as the design 17.4 and «бот и асинхрон — ×0,5»); ◆ for the first wins only in live matches. The server sends the rewards; this is the mock. | Part 1 §5.8, design 17.4 |
| 3 | Entry points | «Против карты» on the arena home is active online, no own map needed; «Играть против карты» on the search (from 10 s) cancels the search and starts the async match. | Part 1 §5.7, ARN-06 |
| 4 | Screen | The match screen: the author card (avatar, nickname, league) with «Норма: N ходов» instead of the opponent bar, no mini map; «Ход N» (`turnsUsed + 1`), «найдено N/M», bombs, «Флажок», «Меню»; no emotes. Texts «Автор карты», «Норма», toast «Бомба: +1 ход к итогу» from the design. | Part 4 §8.7, design 16.12 |
| 5 | Timer | From the server `deadline` (the first turn from the start answer); timeouts are counted by the server and show in the next `turnsUsed`; turn time = `turnSec` from the server. | Part 7 §5 |
| 6 | Mock | Another player's map = an engine random map with a nickname from the pool, the rounded bot norm; a bomb adds 2 to `turnsUsed`; timeouts by the deadline; 40 turns without all targets — loss; the result by the norm (less — win, equal — draw, more — loss, ARN-12); trophies by the engine formula with `async` (×0.5); a history row with mode `async`. | Part 1 §5.7, ARN-12 |
| 7 | Result (17.4) | The result screen with «Ты: 9 ходов · Норма: 11», one map «Карта Milo · твои тапы», «против карты ×0,5»; design texts. | design 17.4 |
| 8 | History details | For `async` only the author's map with my taps; the mock sends the author's map as `maps.mine` too. | Part 7 §5 |
| 9 | Start errors | Offline — the button is inactive; a server error (e.g. no maps to play) — the generic error toast. | Part 1 §8.2 |
| 10 | Out of task 8 | The author's «защита» (● 5 per loss on his map) is server-side; not modelled in the mock. | Part 1 §5.7 |

## Implementation notes

* The contract also gets `deadline` in the `POST /arena/async` answer (the first turn's timer) and open reward objects in `AsyncFinish` — both **to agree with the backend**.
* The final tap answer is `AsyncFinish` without the tap's outcome; the client shows the last tap as a target when it hits one of the revealed targets.
* The async result is shaped like a live one (`asyncSnapshot`) and shown by the same result screen with `mode=async`; trophies after = before + delta (the start keeps the arena trophies).
* The surrender loss in the confirmation uses the engine formula with the author's trophies taken as the player's own (the start answer does not give them).
* `TimerRing` moved to `shared/ui`, used by the live and async match screens.
