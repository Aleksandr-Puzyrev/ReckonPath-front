# 0006. Game engine, stage A

Date: 2026-10-01. Asked by: engine task (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Build the whole engine at once? | **Split into stages.** **A (this task):** model and level input, distances, `initGame` (beacons), `applyTap` for levels and PvP, bomb hint, buoys, target order, fog as data, probe modes, stale answers, continue, stars, validator without `TRIVIAL`/`MOVE_LIMIT`, PRNG, formulas (trophies, leagues, RP, XP), vectors. **B:** bot/solver and norm, `TRIVIAL`/`MOVE_LIMIT`, daily generator, random PvP map. **C:** level codes, match state machine. | Part 6 |
| 2 | Source of expected values in test vectors | The agent picks the most rigorous option: expected values are **derived by hand from the spec pseudocode** on small boards (never produced by the engine itself), each vector carries a `note` explaining the expectation; distance vectors are also cross-checked with the prototype `engine.js`; plus an independent brute-force distance oracle and property-based tests. Mismatches with a future Go engine are raised as questions. | Part 6 §9, Part 1 §12.3 |
| 3 | Where the level schema lives | **`contracts/schemas/level.schema.json`** (JSON Schema 2020-12) in this repository, extended with the §2.5 fields (`beacons`, `buoys`, `targetOrder`, `fog`) and `bombHint`; the engine's zod schema mirrors it. The developer notifies the backend. | Part 6 §7.1, §2.5 |
| 4 | `stars = null` | Allowed (e.g. user levels): the engine returns **`null` stars**. | Part 6 §5.1, §7.1 |
| 5 | Event list | Events follow Part 6 §2.2 (normative), including `blocked`, `alreadyRevealed`, `buoy`, which Part 8 §6.2 omits. | Part 6 §2.2 |
| 6 | PvP tap | `moveLimit = null`; a bomb costs 1 move and emits `bomb` with `skipNext = 1`; probe mode is always `distance`. Turn order belongs to the match state machine (stage C). | Part 6 §2.3 |
| 7 | Tunable constants | Passed to the engine as a config parameter; defaults from Part 6 §7.4. | Part 6 §5, §7.4 |
| 8 | Divisions and rounding | `floor(...)` = 0/1/2 → III/II/I; rounding is half away from zero. | Part 6 §5.3, §5 |
| 9 | Fog | Stored as data (all reveals + `fog`); what is shown is decided by the UI. | Part 6 §2.5 |
| 10 | Indexing | Internally `i = r·cols + c`, externally `[r, c]`; fence edge key `min·128 + max`. | Part 6 §1 |
| 11 | Coverage | Jest threshold ≥ 95% lines for `packages/engine`; ≥ 60 vectors across the stage-A groups. | Part 8 §12.3, Part 6 §9 |

## Interpretations made during implementation

Recorded so the Go engine follows the same reading. Each is covered by a vector or a unit test.

| # | Where the spec is silent or ambiguous | Reading taken |
| --- | --- | --- |
| 12 | §2.5: `order = k+1` is written «при тапе по цели вне очереди» | `order` is stored on **every** found target when `targetOrder` is on (a superset; the UI needs the number for every target). |
| 13 | §6.1 `NOT_CONNECTED`: which cells are «отрезанные» | Cells outside the **largest** connected area; on a tie, the area whose first cell comes first in row-major order is the main one. |
| 14 | §6.1 `DUPLICATE`: «без повторов» | Repeated cells inside any list, a repeated fence edge, and a cell listed in more than one of `streams` / `heavy` / `rocks` (one type per cell, Part 1 §2.2). |
| 15 | §2.5 beacons in hot/cold mode | Every beacon is `none` and beacons never compare with each other; `lastValue` stays `null` («сравнивает только тапы игрока», LVL-FX1). |
| 16 | §2.3 PvP «moveLimit = null» | The engine ignores `moveLimit` for the PvP variant. |
| 17 | Heat thresholds `ceil(p · heatD)` | Computed in integers via basis points, so TS and Go agree exactly. |
| 18 | The `win` event | Carries `moves` and `stars`, as Part 8 §6.2 defines it. |

## Answered after implementation

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 19 | Order of the Bronze loss cap and the bot/async ×0.5 | **Cap first, then ×0.5**: loss −50 in Bronze vs a bot → −15 → round(−7.5) = **−8**. A bot match in Bronze costs half of a ranked one. | Part 6 §5.2 |

## Implementation notes

* Only the constants listed in Part 6 §7.4 are engine config (`rating.*`, `heat.*`, `continue.bonusMoves`, decision #7). The other formula numbers (draw divisor and cap, ×0.5 share, season reset, RP and XP tables, track steps) have no remote config key and stay engine constants.
