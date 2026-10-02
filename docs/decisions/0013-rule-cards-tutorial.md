# 0013. Rule cards, level 1 tutorial, settings (stage 1, task 4)

Date: 2026-10-01. Asked by: rule cards and tutorial (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Sound and Lottie (no assets) | **Postponed** until the sound designer's and motion artist's files exist (stage 6 «Полировка»). This task: cards, tutorial, «Правила», mode chip ⓘ, toggles. | Part 3 §8.2, §9, Part 12 |
| 2 | Card demo | **Live mini-board as in the design** (the Skia board with prepared opened cells), not Lottie. | Part 4 §2.3, design 11.1, 11.3 |
| 3 | Which cards | All 14 design cards plus «Флажки» (level 7) and «Число» (ⓘ on the «Число» chip). | design CARDS, Part 1 §3.1 |
| 4 | Card texts | The rule from Part 5 `rules.*` where the key exists; missing texts (flags, «Число», card titles, «НОВЫЙ ЭЛЕМЕНТ», «Понятно», the «Правила» hint) from the design; EN drafts for review. | Part 5, rule 15 |
| 5 | When a card is shown | Derived from the level: before a level, the cards of its elements and mode that the player has not seen yet; flags marked in the world plan of `packages/content`. The schema's `introduces` stays unchanged. | Part 4 §2.3, Part 1 §3.7 |
| 6 | Level 1 tutorial | Steps of Part 4 §2.2 / design 29.x: (1) dimmed board, one cell highlighted, «Тапни по клетке»; (2) the number appears — «Число — сколько шагов до сигнала»; (3) «Тапни ближе», neighbours highlighted; (4) free search without a limit. Win → simplified result, always 3★ → «Дальше» → level 2 with a move-limit CoachMark on the counter. «Пропустить» (steps 1–3) goes to the Levels tab for now; level 1 stays unbeaten and the tutorial is not shown again (ACC-04). | Part 4 §2.2, Part 11 ACC-01/04 |
| 7 | First launch | With the tutorial neither finished nor skipped, the app opens level 1 with the tutorial (ACC-01). Language step, UMP consent, and `tutorial_step` analytics are out of scope. | Part 11 ACC-01 |
| 8 | Pause → «Правила» | Only the cards already met; a row opens the card, arrows and dots page through the met cards (design 11.3–11.4). | Part 4 §5.3 |
| 9 | Card before a level | Modal 11.1, «ПОНЯТНО» closes it; several new elements → the cards one after another. | design 11.1 |
| 10 | Mode chip | An ⓘ icon; a tap opens the card of the current mode («Число», «Курс», «Горячо-холодно»). | Part 4 §5.1 |
| 11 | Bomb coach card (11.2), `bombHint = false` variant | Later, with world 5 content. | Part 4 §2.3, LVL-BN6 |
| 12 | Settings store | MMKV store: sound, music, vibration. Pause has «Звуки» and «Музыка» toggles (design 10.11) that only save the choice until sound exists; haptics follow the vibration setting now (on by default). The settings screen is a separate task. | Part 8 §6.1, §10.4 |
| 13 | What was shown | «Seen cards» and «tutorial finished / skipped» are stored locally in MMKV; server sync (`onboardingDone`) later. | Part 7 |

## Implementation notes

* During tutorial steps 1–3 the coach mark replaces the answer panel (they said the same thing); step 4 shows both.
* The move-limit hint on level 2 sits in the screen flow under the HUD.
* Token added: `sizes.ruleCard` (demo area 236 pt, demo board 0.55 of the column, design 11.1).
* Found on the device: leaving the screen unmounted the win sheet and the library reported it as a dismissal, so «Дальше» returned to Home; the shared Sheet now ignores dismissals after it unmounts.
* The first launch replaces Home with level 1 (`router.replace`), so Android Back does not land on the empty Home.
