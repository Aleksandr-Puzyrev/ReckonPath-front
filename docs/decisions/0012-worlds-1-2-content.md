# 0012. Content of worlds 1–2 (stage 1, task 3)

Date: 2026-10-01. Asked by: worlds 1–2 content (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Where levels live | **`packages/content`**: one JSON file per level, validated with the engine schema; the app takes the campaign from it. | Part 6 §8.3 |
| 2 | How levels are made | Layouts (size, targets, beacons, fences) designed by hand along the show → check → twist triads; norm, move limit, and stars computed by a script with the bot. A card per world: features, triads, exam, target numbers. | Part 6 §8.1–8.3 |
| 3 | Level 1 (tutorial: no move limit, always 3★) | No `moveLimit`, no `stars`; `content:check` exempts it from `MOVE_LIMIT` (0007 #16 stays for every other level). | Part 4 §2.2, Part 6 §6.1 |
| 4 | Level names | RU and EN drafts by the agent, reviewed by the developer. | — |
| 5 | Move limit | Factor interpolated linearly from the world's start to its end (world 1: 2.0 → 1.6, world 2: 1.7 → 1.5); `moveLimit = ceil(factor · norm)`. One «rest» level per world after the hardest one uses the world's start factor. | Part 6 §8.1 p.4, §8.2 |
| 6 | Informative first number | **Without beacons**: for every cell that can be tapped first, the largest group of equal answers holds at most 60% of the target placements (any first tap cuts ≥ 40%). **With beacons** the beacons are the first numbers: their answers together leave at most 60% of the placements. (Revised after implementation: with a beacon on a small board some first tap always repeats the beacon's information, so «any tap after beacons» could not be met.) | Part 6 §8.1 p.2 |
| 7 | `content:check` | `npm run content:check` prints a table per level (norm, limit, slack, deviation from §8.2, first tap); an invalid level or a non-informative first tap is an error, a curve deviation above 10% a warning. The same checks run as a Jest test. | Part 6 §8.3 |
| 8 | Flags lesson (level 7) | A 5×5 level with many similar candidates where marking checked cells helps; the flags rule card comes with task (4). | Part 1 §3.1 |
| 9 | Win and 3★ rates (§8.2) | Measured by playtest, not by the script; recorded as targets in the world cards. | Part 6 §8.2–8.3 |
| 10 | Scope | Worlds 1–2 use only the plain board, beacons, and fences, mode «Число»; ids `c-1`…`c-24`; the test levels are removed (screen tests keep their own fixtures). | Part 1 §3.1 |

## Implementation notes

* With one target on 4×4–6×6 boards the bot needs 2–3 moves (norm 1.4–3.0), so limits are 3–6 moves; rounding the limit up gives 15–30% `CURVE` warnings in these worlds. Whether the slack suits people is a playtest question (§8.3).
* Target cells were picked from the hand-made terrain by the bot norm (2–3 moves); a target on the bot's first tap (norm 1.0) is excluded.
* A campaign level without star thresholds (the tutorial) gives 3★ on a win, as Part 4 §2.2 states, so the 3 × levels star total stays reachable.
* With norms of 2–3 moves `ceil(norm)` and `ceil(1.15 · norm)` coincide on c-2, c-10, c-11, and c-23 (`stars: [3, 3]`), so 2★ cannot be earned there; the formula follows §8.2, the playtest decides whether to change it.
