import { createBoard, createSolver, directionOf, initGame } from "@reckon-path/engine";
import type { LevelInput } from "@reckon-path/engine";

import { firstNumberShare, isBombOnFirstTap } from "./first-tap";

const level = (overrides: Partial<LevelInput>): LevelInput => ({
  v: 2,
  id: "c-check",
  world: 1,
  rows: 4,
  cols: 4,
  targets: [[1, 2]],
  probeMode: "distance",
  ...overrides,
});

describe("firstNumberShare", () => {
  test("takes the worst first tap without beacons", () => {
    // The worst first tap on an empty 4×4 keeps 6 of 16 placements in one answer group (худший первый тап на пустом поле 4×4 оставляет 6 из 16 вариантов).
    expect(firstNumberShare(level({}))).toBeCloseTo(6 / 16);
  });

  test("takes the beacon numbers on a beacon level", () => {
    // Beacon A1 splits the 15 candidates by distance 1…6; the largest group, distance 3, has 4 cells (маяк A1 делит 15 вариантов по расстоянию; самая большая группа — 4 клетки).
    expect(firstNumberShare(level({ beacons: [[0, 0]] }))).toBeCloseTo(4 / 15);
  });

  test("takes the best first tap by directions in the «Курс» mode (decision 0045 #9)", () => {
    // A centre tap on an empty 4×4 leaves at most 6 of 16 placements behind one direction (центральный тап на пустом 4×4 оставляет за одним направлением не больше 6 из 16 вариантов).
    expect(firstNumberShare(level({ probeMode: "direction" }))).toBeCloseTo(6 / 16);
  });

  test("takes the best first pair of taps in the «Горячо-холодно» mode (decision 0057 #3)", () => {
    // On an empty 4×4 the best pair leaves at most 5 of 16 placements in one answer, a brute force over all pairs gives the same (на пустом 4×4 лучшая пара оставляет в одном ответе не больше 5 из 16 вариантов, перебор всех пар даёт то же).
    expect(firstNumberShare(level({ probeMode: "hotcold" }))).toBeCloseTo(5 / 16);
  });

  test("walks around rocks when comparing the first pair of taps", () => {
    // With a rock on B2 the 15 open cells keep at most 5 placements in one answer of the best pair, as a brute force over shortest paths gives (со скалой на B2 у 15 открытых клеток лучшая пара оставляет в одном ответе не больше 5 вариантов — как даёт перебор по кратчайшим путям).
    expect(firstNumberShare(level({ probeMode: "hotcold", rocks: [[1, 1]] }))).toBeCloseTo(5 / 15);
  });

  test("reads «Курс» answers exactly as the engine's directionOf", () => {
    const course = level({
      rows: 5,
      cols: 5,
      targets: [
        [0, 4],
        [4, 0],
      ],
      rocks: [[2, 2]],
      fences: [
        [
          [1, 1],
          [1, 2],
        ],
      ],
      probeMode: "direction",
    });
    const { board, rules } = createBoard(course);
    const game = initGame(board, { ...rules, moveLimit: null });
    const { hypotheses } = createSolver(game, { levelId: course.id, penalty: 2 });
    const shareOf = (cell: number) => {
      const groups = new Map<string, number>();
      hypotheses.forEach((hypothesis) => {
        const context = {
          ...game,
          board: { ...board, targets: [...hypothesis] },
          found: new Set<number>(),
        };
        const answer = hypothesis.includes(cell) ? "target" : directionOf(context, cell);
        groups.set(answer, (groups.get(answer) ?? 0) + 1);
      });
      return Math.max(...groups.values()) / hypotheses.length;
    };
    const expected = Math.min(
      ...board.kinds.flatMap((kind, cell) => (kind === "rock" ? [] : [shareOf(cell)])),
    );

    expect(firstNumberShare(course)).toBeCloseTo(expected);
  });

  test("measures the distance to target №1 when the order matters", () => {
    const share = firstNumberShare(
      level({
        rows: 5,
        cols: 5,
        targets: [
          [0, 0],
          [4, 4],
        ],
        targetOrder: true,
      }),
    );

    expect(share).toBeLessThan(1);
  });
});

describe("isBombOnFirstTap", () => {
  // On an empty 5×5 the bot opens with a corner, so a corner bomb is on its first tap and a centre one is not (на пустом 5×5 бот начинает с угла: бомба в углу попадает на первый тап, в центре — нет).
  const withBomb = (bomb: [number, number]) =>
    level({ rows: 5, cols: 5, targets: [[0, 0]], bombs: [bomb] });

  test("finds a bomb on a cell the bot opens with (Part 6 §8.1 p.3)", () => {
    expect(isBombOnFirstTap(withBomb([4, 4]))).toBe(true);
  });

  test("accepts a bomb away from the bot's first tap", () => {
    expect(isBombOnFirstTap(withBomb([2, 2]))).toBe(false);
  });
});
