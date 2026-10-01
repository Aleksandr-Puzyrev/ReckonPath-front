import * as fc from "fast-check";

import { applyTap, initGame } from "../game/game";
import { toIdx } from "../grid/grid";
import { LEVEL_SOLVER_BOMB_PENALTY } from "../config/engine-config";
import { createBoard } from "../level/create-board";
import type { GameState } from "../model/types";
import { directionOf } from "../probe/probe";
import { mulberry32, rngFromKey } from "../random/random";
import { arbitraryBoard } from "../test-utils/arbitrary-board";
import { makeLevel } from "../test-utils/make-level";

import { computeNorm, solveOnce } from "./norm";
import { bombProbabilities, chooseMove, createSolver, observeTap } from "./solver";
import type { SolverState } from "./solver";

const setup = (overrides: Record<string, unknown>) => {
  const level = makeLevel({ rows: 4, cols: 4, targets: [[1, 2]], ...overrides });
  const { board, rules } = createBoard(level);
  const game = initGame(board, { ...rules, moveLimit: null });
  const solver = createSolver(game, { levelId: level.id, penalty: LEVEL_SOLVER_BOMB_PENALTY });
  return { board, game, solver };
};

const tapAndObserve = (
  { game, solver }: { game: GameState; solver: SolverState },
  cell: number,
) => {
  const result = applyTap(game, cell);
  return { game: result.state, solver: observeTap(solver, cell, result.events, result.state) };
};

describe("target hypotheses", () => {
  test("start with every non-rock cell for one target", () => {
    const { solver } = setup({ rocks: [[0, 1]] });
    expect(solver.hypotheses).toHaveLength(15);
  });

  test("filter by beacon answers before the first move", () => {
    // Beacon [3,3] shows 3, and the cells at distance 3 from it are [0,3], [1,2], [2,1], [3,0] (маяк [3,3] показывает 3; на расстоянии 3 от него — эти четыре клетки).
    const { solver } = setup({ beacons: [[3, 3]] });
    expect(solver.hypotheses).toEqual([[3], [6], [9], [12]]);
  });

  test("keep only the cells at the observed distance", () => {
    const start = setup({});
    const { solver } = tapAndObserve(start, 0);
    // Distance 3 from [0,0] on an empty 4x4 leaves [0,3], [1,2], [2,1], [3,0] (расстояние 3 от [0,0] на пустом поле 4×4 оставляет эти четыре клетки).
    expect(solver.hypotheses).toEqual([[3], [6], [9], [12]]);
  });

  test("keep only hypotheses that produce the observed direction", () => {
    const start = setup({ probeMode: "direction", targets: [[3, 3]] });
    const { solver } = tapAndObserve(start, 0);
    const context = { board: start.board, dist: start.game.dist, found: new Set<number>() };
    solver.hypotheses.forEach(([target]) => {
      const board = { ...start.board, targets: [target ?? 0] };
      expect(directionOf({ ...context, board }, 0)).toBe("E");
    });
    expect(solver.hypotheses).toContainEqual([15]);
  });

  test("tap a cell that is a target in every hypothesis", () => {
    const start = setup({ targets: [[3, 3]] });
    const { solver } = tapAndObserve(start, 0);
    expect(solver.hypotheses).toEqual([[15]]);
    expect(chooseMove(solver, mulberry32(1))).toBe(15);
  });

  test("count ordered hypotheses with target order", () => {
    const { solver } = setup({
      targets: [
        [1, 2],
        [3, 3],
      ],
      targetOrder: true,
    });
    expect(solver.hypotheses).toHaveLength(16 * 15);
  });

  test("sample large spaces down to 20 000 hypotheses", () => {
    const { solver } = setup({
      rows: 9,
      cols: 9,
      targets: [
        [1, 2],
        [3, 3],
        [5, 5],
        [7, 7],
      ],
    });
    expect(solver.view.isSampled).toBe(true);
    expect(solver.hypotheses).toHaveLength(20_000);
  });
});

describe("mistakes", () => {
  test("tap only cells where a target is possible when making a mistake", () => {
    const start = setup({});
    const { solver } = tapAndObserve(start, 0);
    const possible = new Set([3, 6, 9, 12]);
    for (let seed = 0; seed < 20; seed += 1) {
      expect(possible.has(chooseMove(solver, mulberry32(seed), { mistakeChance: 1 }))).toBe(true);
    }
  });
});

describe("bomb probabilities", () => {
  test("split the risk between the neighbours behind a bomb badge", () => {
    const start = setup({ targets: [[3, 3]], bombs: [[0, 1]] });
    const { solver } = tapAndObserve(start, 0);
    const risk = bombProbabilities(solver);
    expect(risk[toIdx(4, [0, 1])]).toBe(0.5);
    expect(risk[toIdx(4, [1, 0])]).toBe(0.5);
    expect(risk[toIdx(4, [2, 2])]).toBe(0);
  });

  test("spread the risk over the other cells when there is no badge", () => {
    const start = setup({ targets: [[3, 3]], bombs: [[2, 2]] });
    const { solver } = tapAndObserve(start, 0);
    const risk = bombProbabilities(solver);
    expect(risk[toIdx(4, [0, 1])]).toBe(0);
    expect(risk[toIdx(4, [2, 2])]).toBeCloseTo(1 / 13, 12);
  });

  test("use a uniform risk when the hint is off", () => {
    const start = setup({ targets: [[3, 3]], bombs: [[2, 2]], bombHint: false });
    const { solver } = tapAndObserve(start, 0);
    expect(bombProbabilities(solver)[toIdx(4, [0, 1])]).toBeCloseTo(1 / 15, 12);
  });
});

describe("observation details", () => {
  test("keep the previous hot/cold answer across a bomb", () => {
    const start = setup({ probeMode: "hotcold", targets: [[3, 3]], bombs: [[0, 3]] });
    const afterFirst = tapAndObserve(start, 0);
    const afterBomb = tapAndObserve(afterFirst, 3);
    expect(afterFirst.solver.prevAnswer).toBe(0);
    expect(afterBomb.solver.prevAnswer).toBe(0);
  });

  test("count a bomb exploded later as present when an earlier badge was shown", () => {
    // Badge at [0,0] (neighbours [0,1], [1,0]); the bomb at [0,1] explodes afterwards, which explains the badge (значок объясняется взорванной позже бомбой).
    const start = setup({
      targets: [[3, 3]],
      bombs: [
        [0, 1],
        [2, 2],
      ],
    });
    const afterBadge = tapAndObserve(start, 0);
    const afterBomb = tapAndObserve(afterBadge, 1);
    expect(bombProbabilities(afterBomb.solver)[toIdx(4, [1, 0])]).toBeLessThan(1);
  });

  test("treat scores within 1e-9 as a tie", () => {
    const { solver } = setup({});
    const scores = [
      { cell: 1, score: 1, targetShare: 0 },
      { cell: 2, score: 1 - 1e-12, targetShare: 0 },
    ];
    const picked = new Set(
      Array.from({ length: 20 }, (_, seed) => chooseMove(solver, mulberry32(seed), { scores })),
    );
    expect(picked).toEqual(new Set([1, 2]));
  });

  test("rebuild the sample from the full space when it loses the true placement", () => {
    const start = setup({
      rows: 9,
      cols: 9,
      targets: [
        [1, 2],
        [3, 3],
        [5, 5],
        [7, 7],
      ],
    });
    const wrongSample = { ...start.solver, hypotheses: [[0, 1, 2, 3]] };
    const result = applyTap(start.game, toIdx(9, [4, 4]));
    const solver = observeTap(wrongSample, toIdx(9, [4, 4]), result.events, result.state);

    expect(solver.resampleRound).toBe(1);
    expect(solver.hypotheses.length).toBeGreaterThan(0);
    expect(solver.hypotheses.length).toBeLessThanOrEqual(20_000);
  });

  test("sample bomb placements when there are too many", () => {
    const start = setup({
      rows: 9,
      cols: 9,
      targets: [[8, 8]],
      bombs: [
        [0, 1],
        [5, 5],
        [6, 6],
        [7, 7],
      ],
    });
    const { solver } = tapAndObserve(start, 0);
    const risk = bombProbabilities(solver);
    const total = risk.reduce((sum, value) => sum + value, 0);
    expect(total).toBeCloseTo(4, 6);
    expect(risk[toIdx(9, [5, 5])]).toBeGreaterThan(0);
  });
});

describe("solver runs", () => {
  test("always win and never drop the true placement", () => {
    fc.assert(
      fc.property(arbitraryBoard(), fc.nat(), fc.nat(), (board, seed, bombSeed) => {
        const passable = board.kinds.flatMap((kind, idx) => (kind === "rock" ? [] : [idx]));
        if (passable.length < 4) return;
        const target = passable[seed % passable.length] ?? 0;
        const others = passable.filter((idx) => idx !== target);
        const bomb = others[bombSeed % others.length] ?? 0;
        const withTargets = { ...board, targets: [target], bombs: [bomb] };
        const rules = {
          probeMode: "distance" as const,
          moveLimit: null,
          stars: null,
          bombHint: true,
          fog: null,
        };

        let game = initGame(withTargets, rules);
        let solver = createSolver(game, { levelId: "u-prop", penalty: LEVEL_SOLVER_BOMB_PENALTY });
        const rng = mulberry32(seed);
        while (game.status === "playing") {
          const cell = chooseMove(solver, rng);
          const result = applyTap(game, cell);
          solver = observeTap(solver, cell, result.events, result.state);
          game = result.state;
          expect(solver.hypotheses).toContainEqual([target]);
        }
        expect(game.status).toBe("won");
      }),
      { numRuns: 60 },
    );
  });

  test("give the same norm with the step cache as with independent runs", () => {
    const { board, game } = setup({
      targets: [
        [1, 2],
        [3, 0],
      ],
      bombs: [[2, 2]],
    });
    const independent = Array.from({ length: 32 }, (_, run) =>
      solveOnce(board, game.rules, "u-test", run),
    ).reduce((sum, moves) => sum + moves, 0);
    expect(computeNorm(board, game.rules, "u-test").normSum).toBe(independent);
  });

  test("need at least one tap per target", () => {
    const { board, game } = setup({
      targets: [
        [1, 2],
        [3, 0],
        [0, 3],
      ],
    });
    expect(computeNorm(board, game.rules, "u-test").normSum).toBeGreaterThanOrEqual(3 * 32);
  });

  test.each([
    [
      "direction",
      {
        probeMode: "direction",
        targets: [
          [2, 3],
          [0, 1],
        ],
      },
    ],
    ["hotcold", { probeMode: "hotcold", targets: [[2, 3]] }],
    [
      "target order",
      {
        targets: [
          [2, 3],
          [0, 1],
        ],
        targetOrder: true,
      },
    ],
    ["beacons and buoys", { targets: [[2, 3]], beacons: [[0, 0]], buoys: [[3, 3]] }],
  ])("keep the true placement and win with %s", (_name, overrides) => {
    const start = setup(overrides);
    const { targets, targetOrder } = start.board;
    const truth = targetOrder ? targets : [...targets].sort((a, b) => a - b);

    for (let run = 0; run < 8; run += 1) {
      const rng = rngFromKey(`u-test#${run}`);
      let { game, solver } = start;
      while (game.status === "playing") {
        ({ game, solver } = tapAndObserve({ game, solver }, chooseMove(solver, rng)));
        expect(solver.hypotheses).toContainEqual(truth);
      }
      expect(game.status).toBe("won");
    }
  });
});
