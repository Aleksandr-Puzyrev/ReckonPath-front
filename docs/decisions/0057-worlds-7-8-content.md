# 0057. Content of worlds 7–8 (batch 7–8 of 0045)

Date: 2026-11-06. Asked by: clarify-task, iteration 2 task 1 (`docs/remaining-work.md`). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | World cards | Approved as proposed: world 7 «Туман / Fog» (75–87, hot-cold intro 75–77, fog intro 81–83, rest 80, exam 87), world 8 «Открытое море / Open sea» (88–100, target order intro 88–90, rest 94, final 100); roles, modes, elements, and RU/EN titles as in `packages/content/docs/world-7.md`, `world-8.md`. | Part 1 §3.1, Part 6 §8.1–8.2, 0045 #1, #4, #7 |
| 2 | Mode of the final level 100 | «Число». | Part 1 §3.1 |
| 3 | First number in «Горячо-холодно» | `content:check` checks the best first pair of taps: at least one pair whose two answers together cut ≥ 40 % of the hypotheses. | Part 6 §8.1 p.2, 0045 #2 |
| 4 | Targets in world 7 | Exactly 2 on every level, show levels included. | Part 1 §3.1, Part 6 §8.2 |
| 5 | Fog | N = 4 on the show level, 3 on the check and twist, 2 from level 84 on (as in the world 7 card). The 3★ target drop of Part 6 §2.5 concerns the playtest only. | Part 6 §2.5, 0045 #8 |
| 6 | After level 100 | No separate screen; the Home hero «Кампания пройдена» (LVL-28) turns on by itself with 100 levels. | Part 4 §3, Part 11 LVL-28 |
| 7 | Out of the task | Playtest and win rates; `CURVE` warnings on short norms are allowed. | 0045 #8 |

## Round 2 (2026-11-06, during the build)

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 8 | Bombs on «Горячо-холодно» levels 87 and 98: the first tap compares nothing, every cell ties for the bot, so any bomb is on its first tap | Bombs are replaced by ×2 tiles on 87 and 98; bombs stay on «Число» levels only (92, 97, 100 in world 8). | Part 6 §8.1 p.3 |
| 9 | Beacon on «Горячо-холодно» level 98 | A buoy instead: a beacon gives no comparison in this mode. | Part 6 §2.5 |
