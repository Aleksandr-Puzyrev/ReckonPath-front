# Engine test vectors

Shared by the TypeScript engine (Jest) and the Go engine (`go test`). Spec: Part 6 §9. Every file is a JSON array of vectors; every vector has `kind`, `name`, and `note` — the derivation of the expected values. Expected values are derived by hand from the spec (`docs/decisions/0006-engine-stage-a.md` #2), except the vectors marked **golden** (solver norms, solver traces, daily levels), which are pinned from the TS implementation of the approved algorithms (`docs/decisions/0007-engine-stage-b.md` #9) and guard TS↔Go parity.

Coordinates are `[row, col]`, zero-based. Levels use the level v2 format (`contracts/schemas/level.schema.json`).

## `kind: "game"`

```json
{
  "kind": "game",
  "name": "bomb-on-penultimate-move-loses",
  "note": "…",
  "level": { "v": 2, "id": "u-test", "rows": 4, "cols": 4, "targets": [[3, 3]], "probeMode": "distance", "moveLimit": 2 },
  "variant": "level",
  "actions": [{ "tap": [0, 0] }, { "continue": true }],
  "expect": {
    "events": [{ "type": "reveal", "cell": [0, 0], "value": 6, "heat": "cold" }],
    "state": { "movesUsed": 2, "status": "lost" },
    "reveals": [{ "cell": [0, 0], "kind": "distance", "value": 6 }],
    "canContinue": false
  }
}
```

* `variant`: `"level"` (default) or `"pvp"` (Part 6 §2.3).
* `actions`: applied in order; `{ "continue": true }` adds the continue bonus (default 3).
* `expect.events`: **all** events of all actions, in order; each listed field must match, unlisted fields are ignored. A `reveal` event carries the reveal fields flattened (`kind`, `value`, `heat`, `dir`, `cmp`, `epoch`, `bombNear`, `beacon`, `buoy`).
* `expect.state`: listed fields of the final state (`movesUsed`, `bonusMoves`, `status`, `continued`, `epoch`).
* `expect.reveals`: listed fields of the reveal stored for the cell after all actions (including beacons revealed at start).
* `expect.winStars`: the `stars` of the `win` event (used by the star vectors, which omit `events`).
* `expect.canContinue`: whether a continue is allowed after all actions.
* The level itself must pass the validator with no errors.

## `kind: "validate"`

`{ level, context, expect: { codes: [...] } }` — the validator must return exactly this set of codes. `context`: `{ "kind": "campaign" | "custom" | "daily" }` or `{ "kind": "pvp", "format": { "size", "targets", "limits" } }`.

## `kind: "formula"`

`{ fn, input, expect }` — `fn` is one of `trophyDelta`, `applyTrophies`, `leagueOf`, `divisionOf`, `seasonReset`, `rankPoints`, `trackStep`, `xpToNext`. `input` holds the named arguments.

## `kind: "prng"`

`{ key, expect: { seed, u32 } }` — `seed = FNV-1a-32(utf8(key))`; `u32` are the first mulberry32 outputs multiplied by 2^32 (exact integers).

## `kind: "norm"` — golden

`{ level, expect: { normSum } }` — `computeNorm` over 32 runs (`packages/engine/docs/solver.md`). **Golden**: pinned from the TS implementation once the algorithm was approved (decision 0007 #9); they guard TS↔Go parity, not solver quality.

## `kind: "hypotheses"`

`{ level, taps, expect: { hypotheses? | count? + contains? } }` — the solver's remaining target hypotheses after the taps (cells `[row, col]`; combinations in lexicographic order); hand-derived.

## `kind: "solverTrace"` — golden

`{ level, run, expect: { taps, movesUsed } }` — every tap of one solver run with `mulberry32(FNV(levelId + "#" + run))`; golden.

## `kind: "normValidate"`

`{ level, context, normSum, expect: { codes } }` — `validateLevelNorm` with the given norm (`TRIVIAL`, `MOVE_LIMIT`); hand-derived.

## `kind: "dailyTier"`

`{ dateKey, epochKey?, expect: { tier, weekend } }` — `dailyTier` and the UTC weekend check; hand-derived.

## `kind: "daily"` — golden

`{ dateKey, epochKey, expect: { tier, attempt, normSum, level } }` — `generateDaily` (`packages/engine/docs/daily-generator.md`); `attempt` is `null` for the fallback level. Golden, as above.

## `kind: "crc8"`

`{ input, expect }` — CRC-8/SMBUS of the UTF-8 bytes of `input`, two lowercase hex characters (decision 0008 #3).

## `kind: "codeDecode"`

`{ code, expect: { level } | { error } }` — `decodeLevel`. The `RP2-` codes were built independently in Python (`zlib` raw deflate, level 9), so decoding is checked against another deflate implementation; `PELENG1-` codes follow the prototype format. Errors: `CODE_INVALID`, `CODE_NEWER`.

## `kind: "codeRoundTrip"`

`{ level }` — `decodeLevel(encodeLevel(level))` returns the level with `id` replaced by the code-derived id. Encoded strings are not compared: deflate output differs between implementations.

## `kind: "match"` — for the Go engine only

`{ targets, maxTurns, first, turns, expect }` — the match state machine of Part 6 §4.2. It is not part of the TS engine (decision 0008 #5); the TS runner replays the vectors with a test-only reference of `endTurn` (`src/test-utils/simulate-match.ts`), which also rejects a turn by the wrong player or after the end.

* `turns`: in order, `{ player, outcome }` with `outcome` = `normal` | `target` | `bomb` | `timeout` (the result of that player's turn on the opponent's map; `target` adds one found target), or `{ surrender: player }`.
* `expect`: `state` (`playing` | `finalTurn` | `ended`), `turnsUsed`, `found`; for `playing` / `finalTurn` also `current`, `skip`, `timeoutsRow`; for `ended` also `winner` (`A` | `B` | `null` for a draw) and `reason` (`targets` | `afk` | `turnLimit` | `surrender`).
* Hand-derived from the `endTurn` pseudocode and the engine-level scenarios of PVP-01…17 (Part 11 §4); the rest of PVP-01…31 are timers, network, economy, or UI.
* Two clarifications of the pseudocode (decision 0008 #14–15): a third timeout in a row in the final turn ends with reason `afk`; **the turn limit is checked again after skipped turns**, so a skip that brings both players to `MAX_TURNS` ends the match by `turnLimit` with no extra turn (`match-skip-reaches-turn-limit`).
* `annulled` (a server decision on connection loss) has no vectors.

## Arithmetic that both engines must share

* Heat thresholds `ceil(p · heatD)` are computed in integers: `p` is converted to basis points (`round(p · 10000)`), then `ceil(points · heatD / 10000)` by integer division. Floating-point `ceil(0.45 · 20)` can differ from the mathematical result.
* Rounding in formulas is half away from zero; `-0` is normalised to `0`.
* `NOT_CONNECTED` lists the passable cells outside the largest connected area; on a tie, the area whose first cell comes first in row-major order is the main one.
