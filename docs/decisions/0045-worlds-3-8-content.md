# 0045. Content of worlds 3–8 and covers of worlds 5–8 (tail task 5)

Date: 2026-10-23. Asked by: tail task 5 (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Split | Three batches: worlds 3–4, 5–6, 7–8. Each batch first shows the world cards (level roles, boards, elements, RU/EN titles) for approval, then the levels are built and checked. | Part 6 §8.3 |
| 2 | First number rule for the new modes | `content:check`: «Курс» — by the direction answers; «Горячо-холодно» — the first tap compares nothing, so the best first pair of taps is checked; target order — by the distance to target №1; bombs, buoys and fog do not change the first number. | Part 6 §8.1 p.2 |
| 3 | Covers of worlds 5–8 | Gradients in the `world1`–`world4` style (three colours, 135°): 5 `#4A1F2B` `#B4473A` `#FFB65D`; 6 `#2F3B45` `#6B7C86` `#D9C9A3`; 7 `#3B3F63` `#7C86B8` `#D6DDF0`; 8 `#0B2547` `#1F5FA8` `#4FD6E3`; a preview in both themes for approval. | 0039 #3 |
| 4 | How levels are built | As 0012: hand layouts along show → check → twist, a rest level after the hardest, an exam at the end; limits and stars by `content:fix` on the §8.2 curve; RU/EN titles drafted by the agent in the world cards. | 0012, Part 6 §8.1–8.2 |
| 5 | Bombs (world 5) | `content:check` error: a bomb on the bot's first tap (Part 6 §8.1 p.3). | Part 6 §8.1 p.3 |
| 6 | Bomb coach card (11.2), `bombHint = false` | Built with world 5 (batch 5–6). | 0013 #11 |
| 7 | Modes in worlds 7–8 | By Part 1 §3.1: world 7 alternates «горячо-холодно» and the plain mode, world 8 uses every mode; per level in the world cards. | Part 1 §3.1 |
| 8 | Out of the task | Playtest and win rates (§8.3); `CURVE` warnings on short norms are allowed, as in worlds 1–2. | Part 6 §8.3, 0012 |

## Round 2 (2026-10-24, batch 5–6)

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 9 | «Курс» cannot meet «any first tap cuts ≥ 40 %»: a corner tap has only two directions | For «Курс» `FIRST_NUMBER` checks the best first tap: at least one non-rock cell whose first answer cuts ≥ 40 % of the hypotheses. Numeric modes keep the worst first tap. | Part 6 §8.1 p.2, refines #2 |
