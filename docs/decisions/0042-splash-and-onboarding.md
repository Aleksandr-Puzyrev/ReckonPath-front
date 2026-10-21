# 0042. Splash and app onboarding

Date: 2026-10-21. Asked by: tail task 3, splash and onboarding (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Texts missing from Part 5 | Language screen from design 29.1 («Choose language / Выбери язык», «Русский · Интерфейс и тексты на русском», «English · Interface and texts in English», «Язык системы пока не поддерживается. Поменять можно в настройках.», «ПРОДОЛЖИТЬ / CONTINUE»); Home coach marks by Part 4 («Здесь твой текущий уровень», «Все уровни — здесь») with the design's «Дальше» (1 / 2) and «Понятно»; the slow network banner «Обновляем…» by Part 4. | Part 4 §2.1–2.2, design 19.8, 29.1, 29.6 |
| 2 | Native splash | App config: the dark `bg.base` background and the `reckon-emblem` image instead of the template's blue and `splash-icon` (dev build rebuild). | design 1.1 |
| 3 | In-app splash | After the native splash: the emblem with RECKON PATH and sonar rings (Reanimated, motion tokens; no waves under reduced motion); it stays until the bootstrap and the session are ready, at most 2.5 s, then reveals the first screen; when late — enter with the cache and the «Обновляем…» banner on top until the bootstrap answers. Routing (update, maintenance, ban, onboarding, Home) stays with the existing guards. | Part 4 §2.1, design 1.1, 29.6 |
| 4 | Language step | Only on the first launch when the system language is neither RU nor EN, before the level 1 tutorial; the choice relabels the screen at once and is saved as the settings language (0040 #9). | Part 4 §2.2, design 29.1 |
| 5 | Home coach marks | Once, on the first Home visit after level 3 is passed: step 1 at the «Текущая игра» hero, step 2 at the «Уровни» tab, the background dimmed; also for players who skipped the tutorial; stored locally next to the tutorial flag. | Part 4 §2.2, design 19.8 |
| 6 | Out of the task | UMP consent (no SDK; ATT stays before the first ad, 0025); the sign-in choice screen 1.2 (silent guest 0015, login 0019); the changing step 4 hints of 29.3 (Part 5 text by 0013); `tutorial_step` analytics (`TODO`). | 0013, 0015, 0019, 0025 |
