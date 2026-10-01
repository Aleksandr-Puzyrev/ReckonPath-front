# 0009. Game engine, refactoring after review

Date: 2026-10-01. Asked by: engine review (stages A–C). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Bomb penalty in the norm of a PvP map | **PvP penalty 1** (as the PvP bot, 0007 #1); levels, daily, and custom levels keep 2. A bomb still counts 2 moves in every norm (0007 #10). `validateLevelNorm` picks the penalty from the context. | Part 6 §2.4, §6.4, Part 9 §8 |
| 2 | Engine function names vs the verb + object rule | **Names from the Part 6 pseudocode stay** (`applyTap`, `bombNear`, `probeValue`, `stars`, `xpToNext`), and the existing API in the same style (`leagueOf`, `divisionOf`, `heatOf`, `moveLimitOf`, `xpFor`) is not renamed; rule 07 applies to new functions the spec does not name. Recorded as an exception in rule 09. | Part 6 |
| 3 | One entity per file in the engine | **Topic modules stay** (`game.ts`, `probe.ts`, `grid.ts`); a module mixing unrelated topics is split — `formulas.ts` → `league.ts`, `trophies.ts`, `rewards.ts`, `match-result.ts`. | — |
