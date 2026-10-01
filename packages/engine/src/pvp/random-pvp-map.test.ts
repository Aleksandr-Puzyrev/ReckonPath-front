import { PVP_SOLVER_BOMB_PENALTY } from "../config/engine-config";
import { allPairs, distanceBetween } from "../distance/distance";
import { toIdx } from "../grid/grid";
import { createBoard } from "../level/create-board";
import { levelSchema } from "../level/level-schema";
import { mulberry32 } from "../random/random";
import { computeNorm } from "../solver/norm";
import { validateLevel } from "../validator/validate-level";

import { generateRandomPvpMap } from "./random-pvp-map";

const SILVER = {
  size: 7,
  targets: 2,
  limits: { fences: 5, streams: 5, heavy: 2, rocks: 4, bridges: 2, bombs: 3 },
};

describe("generateRandomPvpMap", () => {
  test("builds a valid map in the format limits with distant targets", () => {
    const map = generateRandomPvpMap({
      format: SILVER,
      rng: mulberry32(7),
      medianNorm: 6,
      levelId: "u-random",
    });
    if (map === null) throw new Error("A Silver map should be generated");
    const level = levelSchema.parse(map.level);

    expect(validateLevel(level, { kind: "pvp", format: SILVER })).toEqual([]);
    expect(map.norm.norm).toBeGreaterThanOrEqual(3);
    const { board } = createBoard(level);
    const [first, second] = level.targets.map((cell) => toIdx(SILVER.size, cell));
    if (first === undefined || second === undefined) throw new Error("Silver has two targets");
    const cells = SILVER.size ** 2;
    expect(distanceBetween(allPairs(board), cells, first, second)).toBeGreaterThanOrEqual(2);
  });

  test("measures the norm with the PvP bomb penalty", () => {
    const map = generateRandomPvpMap({
      format: SILVER,
      rng: mulberry32(7),
      medianNorm: 6,
      levelId: "u-random",
    });
    if (map === null) throw new Error("A Silver map should be generated");
    const { board, rules } = createBoard(levelSchema.parse(map.level));
    expect(map.norm).toEqual(computeNorm(board, rules, "u-random", PVP_SOLVER_BOMB_PENALTY));
  });

  test("is reproducible for the same random source", () => {
    const options = { format: SILVER, medianNorm: 6, levelId: "u-random" };
    expect(generateRandomPvpMap({ ...options, rng: mulberry32(3) })).toEqual(
      generateRandomPvpMap({ ...options, rng: mulberry32(3) }),
    );
  });

  test("returns a map below the range when the median is out of reach", () => {
    const map = generateRandomPvpMap({
      format: SILVER,
      rng: mulberry32(11),
      medianNorm: 100,
      levelId: "u-random",
    });
    if (map === null) throw new Error("A fallback map should be returned");
    expect(map.norm.norm).toBeLessThan(0.8 * 100);
  });

  test("returns null when no valid map can be built", () => {
    const impossible = { size: 10, targets: 1, limits: {} };
    expect(
      generateRandomPvpMap({
        format: impossible,
        rng: mulberry32(1),
        medianNorm: 4,
        levelId: "u-random",
      }),
    ).toBeNull();
  });
});
