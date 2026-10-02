# @reckon-path/content

Campaign levels of Reckon Path (spec Part 6 §8.3, decision 0012): one JSON file per level in `levels/`, validated with the engine's `levelSchema` when loaded (`src/campaign.ts`).

## Workflow

1. Edit a layout in `levels/c-N.json` (size, targets, beacons, fences, title). Do not set `moveLimit` and `stars` by hand.
2. `npm run content:fix` — computes the bot norm and writes `moveLimit = ceil(factor · norm)` and `stars = [ceil(norm), ceil(1.15 · norm)]` (factor from `src/world-plans.ts`, Part 6 §8.2).
3. `npm run content:check` — prints the report and fails on errors; the same checks run in `npm test`.

Both scripts are Jest runs of `src/content.test.ts` (the repository has no TypeScript script runner): `content:check` sets `CONTENT_REPORT=1` to print the table, `content:fix` sets `CONTENT_WRITE=1` to write the computed limits into `levels/*.json` and then checks the written levels. The `VAR=1 jest` form needs a POSIX shell (macOS, Linux, Git Bash).

## Checks (`src/check/`)

| Code | Kind | Meaning |
| --- | --- | --- |
| validator codes | error | `validateLevel` and `validateLevelNorm` for the campaign; level 1 (tutorial) has no move limit and is exempt from `MOVE_LIMIT` |
| `LIMITS_OUT_OF_DATE` | error | `moveLimit` / `stars` differ from the computed values — run `content:fix` |
| `FIRST_NUMBER` | error | the first number cuts less than 40% of target placements: the beacons' numbers on beacon levels, otherwise any first tap (Part 6 §8.1 p.2) |
| `TUTORIAL_LIMIT` | error | level 1 must have no limit and no stars |
| `CURVE` | warning | slack (`moveLimit / norm`) deviates from the world curve by more than 10% |

With norms of 2–3 moves the rounding up of the limit alone gives 15–30% slack deviation, so `CURVE` warnings are expected in worlds 1–2.

World cards: [`docs/world-1.md`](docs/world-1.md), [`docs/world-2.md`](docs/world-2.md).
