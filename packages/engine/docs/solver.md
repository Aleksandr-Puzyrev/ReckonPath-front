# Solver (bot) and level norm

Normative for both engines (TS and Go). Sources: spec Part 9 §8, Part 6 §2.4–2.5, §6.1, decisions 0007. Every step and every iteration order below is part of the contract: a different order gives different tie-breaks and therefore a different norm.

## What the solver knows

Visible: `rows`, `cols`, cell kinds, bridges, fences, `probeMode` (always `distance` in a PvP game, Part 6 §2.3), `targetOrder`, `bombHint`, the number of targets `k`, the number of bombs `B` (shown to players), beacon reveals. Hidden: target cells, bomb cells, buoy cells. The solver never reads hidden data; it only sees what `applyTap` returns to a player.

## Target hypotheses

* Candidates: cells that are not rocks and not beacons, in row-major order.
* A hypothesis is a set of `k` candidate cells; with `targetOrder` it is an ordered tuple (`h[0]` is target #1).
* Enumeration order: lexicographic over candidate indices (combinations; permutations of each combination in lexicographic order when `targetOrder` is on).
* If the full space has more than 200 000 hypotheses, the solver keeps a sample of 20 000 drawn with `rngSample = mulberry32(FNV(levelId + "#sample"))`: repeatedly draw `k` distinct candidate positions (`randInt(0, candidates − 1)`, redraw on repeats), skip duplicates of already sampled hypotheses. When filtering empties the sample, the full space is enumerated once more and filtered by every observation so far; if more than 200 000 hypotheses remain, 20 000 of them are kept by drawing distinct indices `randInt(0, kept − 1)` with `mulberry32(FNV(levelId + "#sample" + n))` for the n-th re-sample (`n` starts at 1), in ascending index order.

## Observations and filtering

After each tap the solver keeps only the hypotheses under which the engine would have produced the same result:

| Result of the tap | Keep hypothesis `h` when |
| --- | --- |
| `reveal` distance `v` | `probeValue_h(c) = v` (nearest unfound target of `h`; with target order, the lowest-numbered unfound one) |
| `reveal` direction `d` | `direction_h(c) = d` (Part 6 §3.2 with `h`) |
| `reveal` hot/cold `cmp` | `compare(probeValue_h(c), probeValue_h(prev)) = cmp`, where `prev` is the last cell that gave an answer since the last target found (none → `cmp` must be `none`). The hidden `value` is never used. |
| `targetFound` at `c` | `c ∈ h` (with target order: `h[order − 1] = c`) |
| bomb at `c`, buoy at `c`, any non-target answer at `c` | `c ∉ h` |

Beacon reveals are applied as observations before the first move.

## Bomb placements

* Candidates: unrevealed, non-rock cells. A placement is a set of `B − exploded` cells, enumerated in lexicographic order; above 200 000 placements, 20 000 are sampled as for targets with `mulberry32(FNV(levelId + "#bombs" + t))`, `t` = number of taps so far.
* Each revealed cell with a `bombNear` flag `f`, observed at time `t`, keeps only placements where «some N4 neighbour of the cell holds a bomb not yet exploded at `t`» equals `f`. With `bombHint = false` there are no such constraints.
* `P_bomb(c)` = share of kept placements containing `c` (0 for revealed cells).
* With no constraint at all (no badges observed yet, or `bombHint = false`) the share is computed directly as `(B − exploded) / candidates`. If no placement survives (only possible with sampling), the same uniform share is used.

## Choosing a move

1. If some unrevealed cell is a target in **every** target hypothesis, tap the lowest-index such cell.
2. Otherwise, for each unrevealed non-rock cell `c` in row-major order:
   * `P_target(c)` = share of hypotheses with `c` among their unfound targets;
   * outcomes per hypothesis: `"target"` if `c` is an unfound target of `h`, otherwise the answer the engine would show (distance value / direction / hot-cold compare);
   * `H(c) = log2(N) − Σ nᵢ·log2(nᵢ) / N` over outcome counts `nᵢ`, summed in ascending order of the outcome key, `N` = number of hypotheses. Outcome keys are integers: `−1` = target, otherwise the distance value; direction `N = 0, E = 1, S = 2, W = 3`; hot/cold `none = 0, warmer = 1, colder = 2, same = 3`;
   * `score(c) = H(c) + P_target(c) − P_bomb(c) · penalty`, penalty 2 (level) or 1 (PvP).
3. Cells with `score ≥ max − 1e-9` are tied (the tolerance absorbs last-bit differences of `log2` between languages). One tied cell → tap it; several → `tied[floor(rngRun() · tied.length)]`.
4. Difficulty `p` (PvP only, 0 for the norm): before step 1, if `rngRun() < p`, tap `cells[floor(rngRun() · cells.length)]` where `cells` are unrevealed cells with `P_target > 0` (all unrevealed cells if there are none), in row-major order. With `p = 0` no random number is drawn here.

`rngRun = mulberry32(FNV(levelId + "#" + run))`, one generator per run, drawn only where stated above.

## Norm

* 32 runs, `run = 0 … 31`. Each run plays the level variant from a fresh `initGame` with `moveLimit` ignored until all targets are found; moves are counted as `movesUsed` (a bomb counts 2).
* `normSum = Σ moves`; `norm = normSum / 32`.
* `TRIVIAL` (pvp/custom): `norm < 3` ⇔ `normSum < 96`.
* `MOVE_LIMIT` (campaign/daily): an error when `moveLimit < ceil(12 · normSum / 320)` (that is `ceil(1.2 · norm)`, by integer division), or `stars[0] > stars[1]`, or `stars[1] > moveLimit`.
* `ceil(1.3 · norm)`, `ceil(norm)`, `ceil(1.15 · norm)` for the daily generator: `ceil(13 · normSum / 320)`, `ceil(normSum / 32)`, `ceil(115 · normSum / 3200)`, all by integer division.
