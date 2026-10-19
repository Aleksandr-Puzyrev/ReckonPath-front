# 0033. Search and VS

Date: 2026-10-19. Asked by: stage 4 task 5 (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | After VS | Tasks 5 and 6 are done as one: search → VS → match. The match screen gets its own clarification round before implementation. | 0028 #6 |
| 2 | 20 s without an opponent | The 15.3 state («Сигнал захвачен · Соперник не найден за 20 с — играем с тренировочным», «К МАТЧУ») and an automatic move to the bot match; «К матчу» goes at once. | Part 4 §8.3, design 15.3 |
| 3 | No active map (ARN-03) | A dialog «Нет карты для боя» / «No map for the fight» with «Собрать карту» (editor, new map) and «Случайная» / «Random map»: a server random map saved as «Карта N», activated, then the search starts. | ARN-03 |
| 4 | Match on another device (32.2) | The contract gets `IN_MATCH` details `{ matchId, endpoint }` (**to agree with the backend**); «Вернуться в матч» connects with `?resume=1`. Texts of 32.2 without the device / turn line. | Part 1 §5.5, design 32.2 |
| 5 | Search (15.1–15.2) | A simple Reanimated radar (0028 #4), «Ищем соперника…», a 0:07 timer, «5×5 · BRONZE III · 1 цели» (design pattern), «Твоя карта» with a preview, name and bot estimate, «Отмена»; «Играть против карты» shows from 10 s, inactive until task 8. | Part 4 §8.3, design 15.1–15.2 |
| 6 | Backgrounded search | The 32.3 state on the search screen: «Поиск остановлен · Приложение было свёрнуто — очередь сброшена», «ИСКАТЬ СНОВА» / «На арену». | Part 4 §8.3, design 32.3 |
| 7 | Link sheet before the first match | A guest sees the 0019 link sheet once before the first search; «Позже» starts the search. | Part 1 §7.6, ARN-02, 0019 #4 |
| 8 | VS (15.4–15.5) | Halves in `player.me` / `player.opponent` (Part 3 tokens added), a 96 letter avatar, league emblem, trophies; no titles and frames (cosmetics out); the bot shows «Тренировочный соперник» and `match.botTrophies`; then «Жребий…» and «Первым ходит: {{name}}» on the first turn, «Первым ходишь: ты» / «You go first» from the design. | Part 4 §8.4, design 15.4–15.5 |
| 9 | `matchStore` | The Part 8 §6.3 state machine (`idle → searching → found → intro → …`), changed only by server messages, over the task 2 `ws`. | Part 8 §6.3 |
| 10 | Search errors | `MAP_INVALID` (ARN-04) — toast `errors.MAP_INVALID` and the editor of the active map; `BANNED` — a toast until the ban screen (task 10); a lost connection — toast `errors.NETWORK`, back to the arena. | Part 7 §2 |
| 11 | Effects | Haptic `notificationSuccess` on «Соперник найден»; the `match_found` sound comes with audio (none in the project yet). | Part 3 §9 |
| 12 | Maintenance (NET-05) | «В бой» is inactive under `maintenance` (existing system state); no «Техработы в 15:00» banner (no data about upcoming maintenance). | NET-05 |
