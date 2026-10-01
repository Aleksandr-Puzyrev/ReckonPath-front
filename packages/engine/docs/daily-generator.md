# Daily level generator

Normative for both engines (TS and Go): the client builds the daily offline, the server rebuilds it to verify attempts. Sources: spec Part 6 §6.2–6.3, Part 1 §4.1, decisions 0007. Every random draw below is listed in order; a different order gives a different level.

Helpers: `rng()` — mulberry32 output in [0, 1); `randInt(a, b) = a + floor(rng() · (b − a + 1))`; `pick(list) = list[floor(rng() · length)]`.

## Inputs

* `dateKey` — `YYYY-MM-DD`, the UTC game day.
* `epochKey` — parameter, default `2026-10-01`.
* `days = max(0, whole UTC days from epochKey to dateKey)`; `tier = min(20, 1 + floor(days / 7))`.
* `weekend` — `dateKey` is a Saturday or Sunday (UTC).

## Tier table (Part 6 §6.3)

| Tiers | Size | Targets | Fence lines | Stream lines | ×2 | Rocks | Bridges | Bombs | Probe modes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1–2 | 5–5 | 1–1 | 0–0 | 0–0 | 0–0 | 0–0 | 0–0 | 0–0 | distance |
| 3–4 | 6–6 | 1–1 | 1–1 | 0–1 | 0–0 | 0–0 | 0–0 | 0–0 | distance |
| 5–7 | 6–7 | 1–2 | 1–1 | 1–1 | 0–1 | 0–0 | 0–0 | 1–1 | distance |
| 8–10 | 7–7 | 2–2 | 1–2 | 1–1 | 1–2 | 1–3 | 0–0 | 1–2 | distance, direction |
| 11–14 | 7–8 | 2–2 | 2–2 | 1–2 | 1–2 | 2–4 | 1–1 | 2–2 | distance, direction, hotcold |
| 15–20 | 8–9 | 2–3 | 2–2 | 2–2 | 2–3 | 3–6 | 1–2 | 2–3 | distance, direction, hotcold |

Weekend: size +1 (at most 9) and targets +1 (at most 5).

## One attempt (`attempt = 0 … 49`)

`rng = mulberry32(FNV(dateKey + "#" + attempt))`, then, in this order:

1. `size = randInt(sizeMin, sizeMax)` (+1 on weekends, cap 9); the board is `size × size`.
2. `targetCount = randInt(min, max)` (+1 on weekends, cap 5).
3. `probeMode = pick(modes)`.
4. Fences — `lines = randInt(min, max)`:
   * 1 line: `kind = pick([col, row, zigzag])`;
     * `col`: `colGapWall(col = randInt(1, size − 2), gapRow = randInt(0, size − 1))` — a wall between `col` and `col + 1` on every row except `gapRow`;
     * `row`: `rowGapWall(row = randInt(1, size − 2), gapCol = randInt(0, size − 1))`;
     * `zigzag`: `colA = randInt(1, max(1, floor(size / 2) − 1))`, `colB = randInt(min(size − 2, colA + 1), size − 2)`, `split = randInt(1, size − 1)`; wall between `colA`/`colA + 1` on rows `< split`, between `colB`/`colB + 1` on rows `≥ split`.
   * 2 lines: `kind = pick([doubleCol, doubleRow])`; `a = randInt(1, max(1, floor(size / 2) − 1))`, `b = randInt(min(size − 2, a + 2), size − 2)`, then two `colGapWall` (or `rowGapWall`) at `a` and `b`, each with its own gap drawn `randInt(0, size − 1)` (first for `a`, then for `b`).
5. Streams — `lines = randInt(min, max)`; for each line `kind = pick([col, row, partialCol, partialRow])`:
   * `col`: all cells of column `randInt(0, size − 1)`; `row`: all cells of row `randInt(0, size − 1)`;
   * `partialCol`: `col = randInt(0, size − 1)`, `start = randInt(0, max(0, size − 3))`, `end = min(size − 1, start + randInt(2, 4))`; cells `start … end` of the column; `partialRow` symmetric.
   * Overlapping stream cells are kept once.
6. ×2 (`heavy`) — `count = randInt(min, max)`, then `count` cells by **free-cell draw** among open cells.
7. Rocks — `count = randInt(min, max)`, by free-cell draw among open cells (not stream, not heavy).
8. Bridges — `count = randInt(min, max)`, by free-cell draw among stream cells without a bridge (skipped when there are no streams).
9. Targets — `targetCount` cells by free-cell draw among non-rock cells.
10. Bombs — `count = randInt(min, max)`, by free-cell draw among non-rock, non-target cells.

**Free-cell draw**: `idx = randInt(0, size² − 1)`; accept if the cell is eligible and not yet chosen, otherwise draw again; at most 300 draws per element group (fewer cells are placed if the guard runs out).

Then:

* Level: `{ v: 2, id: "d-" + dateKey, rows: size, cols: size, … , probeMode }` with the cells above, `bombHint` default.
* If `validateLevel(level, daily)` returns any error → next attempt.
* `normSum` by the solver (`solver.md`); `moveLimit = ceil(1.3 · norm)`, `stars = [ceil(norm), ceil(1.15 · norm)]` (integer formulas in `solver.md`). The level is returned.

## Fallback (decision 0007 #7)

If all 50 attempts fail: `rng = mulberry32(FNV(dateKey + "#fallback"))`; a 5×5 board with one target at `randInt(0, 24)`, `probeMode = distance`, limits from its norm as above. To be replaced by the 30 manual levels.
