# 0007. Game engine, stage B (solver, daily, random PvP map)

Date: 2026-10-01. Asked by: engine stage B (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Move score of the solver | `score(c) = H(c) + P_target(c) − P_bomb(c) · penalty`: H — entropy (bits) of the answer distribution at c over target hypotheses, «target found» being its own outcome; 1 bit ≡ 1 move; penalty 2 in levels, 1 in PvP. A cell that is a target in every hypothesis is tapped first. | Part 6 §2.4, Part 9 §8 |
| 2 | Bomb probability | Bomb placements of exactly B bombs are enumerated independently of target hypotheses and filtered by every «bomb near» observation; `P_bomb(c)` = share of placements with a bomb at c. | Part 6 §2.4, Part 1 §2.5 |
| 3 | Ties and the 32 runs | Ties broken by `mulberry32(FNV(levelId + "#" + run))`; hypotheses and cells iterated in row-major order; norm and `ceil(1.2 · norm)` computed in integers (sum of moves over 32 runs). | Part 9 §8 |
| 4 | Daily `EPOCH` | An engine **parameter** (the engine reads no env/config). Default **`2026-10-01`**; later delivered by remote config per environment, so staging can test any tier. Not an env variable: the client and the server must regenerate the same daily level. | Part 6 §6.3 |
| 5 | Daily generator procedure | Port the prototype helpers (fence lines with one gap, stream lines) and write the exact step-by-step algorithm in `packages/engine/docs/daily-generator.md`, approved by the developer before coding. | Part 6 §6.3 |
| 6 | Part 1 §4.1 vs Part 6 §6.3 (×2 / bridge tiers, weekend rule) | **Part 6 wins**: ×2 from tiers 5–7, bridges from 11–14, weekend = size +1 and +1 target. | Part 6 §6.3 |
| 7 | 30 manual fallback levels (absent) | Until they exist: a fixed tier-1 level (5×5, one target, seeded from the date). | Part 6 §6.3 |
| 8 | Performance (9×9 weekend dailies, up to 1.6 M hypotheses) | Implement seeded sampling (20 k when > 200 k), measure on a device; come back with options if too slow. | Part 9 §8 |
| 9 | Solver test vectors | Hand-derived where feasible (generator, `TRIVIAL` / `MOVE_LIMIT`, hypothesis filtering on 4×4); **golden** vectors pinned from the implementation for bot moves and norms once the algorithm is approved (they guard TS↔Go parity, not correctness); property tests for correctness. Exception to 0006 #2 for the solver only. | Part 6 §9 |
| 10 | Bomb hit in the norm | Counts 2 moves (tap + 1) in levels and async. | Part 9 §8, ARN-12 |
| 11 | Difficulty | Norm uses p = 0. `p` is an API parameter; think time and timeouts are server match logic. | Part 9 §8 |
| 12 | Level features in the solver | Beacons are free initial observations; with target order hypotheses are ordered; buoys are tapped as normal cells, their bonus is not part of the norm; fog does not affect the norm. | Part 6 §2.5 |
| 13 | `TRIVIAL` / `MOVE_LIMIT` | A separate `validateLevelNorm` (expensive); `validateLevel` stays fast for live editor checks. | Part 6 §6.1 |
| 14 | Random PvP map | Client and server generate independently (the map is validated anyway), so no exact draw order. The format median norm is a parameter; after 30 attempts the map closest to the median wins. | Part 6 §6.4 |
| 15 | Daily date | UTC; level id `d-YYYY-MM-DD`. | Part 1 §4.1 |

## Corrections

* `../arena` is a different game (row/column shoving), not a Reckon Path PvP prototype; `docs/decisions/0002-setup-follow-ups.md` #3 is corrected.

## Implementation notes

* Golden daily vectors were re-pinned after fixing the bridge step to match `daily-generator.md` («skipped when there are no streams»): the earlier code drew a bridge count on tiers without streams, which shifted later draws.
* Random PvP map (#14): a random fence is horizontal with probability 0.5 — an implementation detail, since the client and the server generate independently.
* Speed (Node on a Mac, not yet on a phone): norm of a 4×4 level ~10 ms, 7×7 with 2 targets ~40 ms, 9×9 with 3 targets ~0.6 s; daily tiers 1–16 under 0.2 s, tier 20 weekday (9×9, 3 targets) ~1.4 s, tier 20 weekend (9×9, 4 targets, sampled) ~4 s. Phones are expected 3–5× slower. Device measurement is pending (#8).

## Answered after implementation

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 16 | `MOVE_LIMIT` for a campaign/daily level without `moveLimit` | **Keep reporting `MOVE_LIMIT`** for now (campaign levels have a hard move limit). | Part 6 §6.1, Part 1 §3 |
