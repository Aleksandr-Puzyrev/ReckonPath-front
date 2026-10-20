# 0037. Arena onboarding

Date: 2026-10-19. Asked by: stage 4 task 9 (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Writing `onboardingDone` | `POST /arena/onboarding` → `{ onboardingDone: true }` (**to agree with the backend**), called after the tutorial map is saved; the mock sets the flag. | Part 1 §5.12 p. 5, Part 7 §5 |
| 2 | Starting the training match | `queue.join` with `{ format, mode: "training" }` and no `mapId` (**to agree with the backend**): an immediate `match.found` with a `training` bot, `turnSec` 10, ready maps for the mentor and a template map for the player, no trophies or history. | Part 1 §5.12 p. 2, 0028 #3 |
| 3 | Targets in the editor tutorial | 1 target and 1 bomb by the Bronze format (Part 1 §5.2); the design texts say «1 цель» instead of «2 цели». | Part 1 §5.2, §5.12, design 30.2 |
| 4 | When and steps | The first visit of the unlocked arena with `onboardingDone = false` opens the onboarding instead of the home: (1) three rule cards (13.2), (2) unseen campaign element cards (fence, stream, bridge, ×2, rock, bomb), (3) the training match, (4) the editor tutorial. «Я знаю правила» skips 1–3, never the map. | Part 1 §5.12, §3.7 |
| 5 | Rule cards (13.2) | Design texts «Ходите по очереди», «Бомба = пропуск хода», «Кто первым — тот победил»; the turn time from the format («На ход 5 секунд в формате 5×5»); «Дальше», «К тренировке» on the last; «1 / 3». | design 13.2 |
| 6 | Training (30.1) | The live match screen with «Наставник · ТРЕНИРОВКА · лёгкий бот · кубки не меняются», step hints from the design («Тапни любую клетку», «Ходите по очереди», «Бомба! В матче это пропуск хода», «Отлично! Так и выигрывают дуэли · Дальше — собери свою карту»), no «Сдаться» and «сдаться нельзя — это тренировка»; the easy bot plays random moves; if the bot wins — «Наставник оказался быстрее · Дальше — собери свою карту» and on. | Part 1 §5.12 p. 2, design 30.1 |
| 7 | Editor tutorial (30.2) | The editor in tutorial mode: a filled 5×5 template (stream, bridge, rocks, fence), only «Цель» and «Бомба», design validator texts (rock, bomb on a target, limits), the usual status line; «Сохранить» activates the map, then `POST /arena/onboarding` and the arena home. | Part 1 §5.12 p. 3, design 30.2 |
| 8 | First ranked match | In the fake the first bot after onboarding plays random moves too. | Part 1 §5.12 p. 4 |
| 9 | Analytics | `arena_onboarding_step`, `arena_training_end` stay a `TODO` (no analytics module yet). | Part 1 §5.12 |
