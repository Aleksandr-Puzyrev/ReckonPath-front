import {
  createBoard,
  createSolver,
  edgeKey,
  gridNeighbors,
  initGame,
  probeValue,
  scoreCells,
} from "@reckon-path/engine";
import type { GameState, Idx, LevelInput } from "@reckon-path/engine";

const SOLVER_PENALTY = 2;
const TARGET_KEY = -1;
const TIE_TOLERANCE = 1e-9;
const PAIR_ANSWERS = { firstFound: 0, secondFound: 1, warmer: 2, colder: 3, same: 4 } as const;
const PAIR_ANSWER_COUNT = 5;

type Hypotheses = readonly (readonly Idx[])[];

const passableCells = (game: GameState) =>
  game.board.kinds.flatMap((kind, cell) => (kind === "rock" ? [] : [cell]));

// Each hypothesis is probed once for every cell; the 9×9 boards have up to 85 000 hypotheses, so per-tap objects would take minutes (каждый вариант зондируется один раз на клетку; на полях 9×9 до 85 000 вариантов, и объекты на каждый тап заняли бы минуты).
const probeTable = (game: GameState, hypotheses: Hypotheses, cells: readonly Idx[]) => {
  const values = new Int16Array(hypotheses.length * cells.length);
  const hits = new Uint8Array(hypotheses.length * cells.length);
  hypotheses.forEach((hypothesis, row) => {
    const context = {
      ...game,
      board: { ...game.board, targets: [...hypothesis] },
      found: new Set<Idx>(),
    };
    cells.forEach((cell, column) => {
      values[row * cells.length + column] = probeValue(context, cell);
      hits[row * cells.length + column] = hypothesis.includes(cell) ? 1 : 0;
    });
  });
  return { values, hits };
};

// The same neighbour order as the engine's directionOf, so ties pick the same direction (тот же порядок соседей, что в directionOf движка, поэтому при равенстве выбирается то же направление).
const neighbourColumns = (game: GameState, cells: readonly Idx[]) => {
  const columns = new Map(cells.map((cell, column) => [cell, column]));
  return cells.map((cell) =>
    gridNeighbors(game.board, cell)
      .filter(
        ({ idx }) => game.board.kinds[idx] !== "rock" && !game.board.fences.has(edgeKey(cell, idx)),
      )
      .map(({ idx }) => columns.get(idx) ?? 0),
  );
};

// The answer of a tap under a hypothesis: a find, the direction (as the neighbour it points to) or the number (ответ тапа при варианте целей: находка, направление — как соседняя клетка, на которую оно указывает, — или число).
const answerKeys = (game: GameState, hypotheses: Hypotheses) => {
  const cells = passableCells(game);
  const { values, hits } = probeTable(game, hypotheses, cells);
  const neighbours = neighbourColumns(game, cells);
  const isDirection = game.rules.probeMode === "direction";
  const keyAt = (row: number, column: number) => {
    const offset = row * cells.length;
    if (hits[offset + column] === 1) return TARGET_KEY;
    if (!isDirection) return values[offset + column] ?? 0;
    let best = TARGET_KEY;
    let bestValue = Infinity;
    (neighbours[column] ?? []).forEach((neighbour) => {
      const value = values[offset + neighbour] ?? 0;
      if (value < bestValue) {
        best = neighbour;
        bestValue = value;
      }
    });
    return best;
  };
  return { cells, values, hits, keyAt };
};

const largestShare = (answers: readonly (number | string)[]) => {
  const groups = new Map<number | string, number>();
  answers.forEach((answer) => groups.set(answer, (groups.get(answer) ?? 0) + 1));
  return Math.max(...groups.values()) / answers.length;
};

const tapShares = (game: GameState, hypotheses: Hypotheses) => {
  const { cells, keyAt } = answerKeys(game, hypotheses);
  return cells.map((_cell, column) =>
    largestShare(hypotheses.map((_hypothesis, row) => keyAt(row, column))),
  );
};

// The first hot-cold tap compares with nothing, so the first number is the answer of the best first pair (первый тап «горячо-холодно» сравнивать не с чем, поэтому первое число — ответ лучшей первой пары).
const bestPairShare = (game: GameState, hypotheses: Hypotheses) => {
  const { cells, values, hits } = answerKeys(game, hypotheses);
  const width = cells.length;
  const counts = new Int32Array(PAIR_ANSWER_COUNT);
  let best = hypotheses.length;
  for (let first = 0; first < width; first += 1) {
    for (let second = 0; second < width; second += 1) {
      if (first === second) continue;
      counts.fill(0);
      let isWorse = false;
      for (let row = 0; row < hypotheses.length && !isWorse; row += 1) {
        const offset = row * width;
        const firstValue = values[offset + first] ?? 0;
        const secondValue = values[offset + second] ?? 0;
        let answer: number = PAIR_ANSWERS.same;
        if (hits[offset + first] === 1) answer = PAIR_ANSWERS.firstFound;
        else if (hits[offset + second] === 1) answer = PAIR_ANSWERS.secondFound;
        else if (secondValue < firstValue) answer = PAIR_ANSWERS.warmer;
        else if (secondValue > firstValue) answer = PAIR_ANSWERS.colder;
        counts[answer] = (counts[answer] ?? 0) + 1;
        isWorse = (counts[answer] ?? 0) >= best;
      }
      if (!isWorse) best = Math.max(...counts);
    }
  }
  return best / hypotheses.length;
};

const solverOf = (level: LevelInput) => {
  const beacons = level.beacons ?? [];
  const { board, rules } = createBoard({ ...level, beacons: [] });
  const game = initGame(board, { ...rules, moveLimit: null });
  const solver = createSolver(game, { levelId: level.id, penalty: SOLVER_PENALTY });
  return { game, solver, beaconCells: beacons.map(([row, col]) => row * board.cols + col) };
};

// Beacons are free first numbers, so on beacon levels they are what must be informative, not a tap (маяки — бесплатные первые числа, поэтому информативны должны быть они, а не тап).
const beaconShare = (game: GameState, hypotheses: Hypotheses, beaconCells: readonly Idx[]) => {
  const candidates = hypotheses.filter(
    (hypothesis) => !hypothesis.some((cell) => beaconCells.includes(cell)),
  );
  const { cells, keyAt } = answerKeys(game, candidates);
  const beaconColumns = beaconCells.map((cell) => cells.indexOf(cell));
  return largestShare(
    candidates.map((_hypothesis, row) =>
      beaconColumns.map((column) => keyAt(row, column)).join(","),
    ),
  );
};

export const firstNumberShare = (level: LevelInput) => {
  const { game, solver, beaconCells } = solverOf(level);
  const { hypotheses } = solver;
  if (game.rules.probeMode === "hotcold") return bestPairShare(game, hypotheses);
  if (beaconCells.length > 0) return beaconShare(game, hypotheses, beaconCells);
  const shares = tapShares(game, hypotheses);
  // A corner tap has only two directions, so «Курс» needs just one informative first tap (у тапа в угол всего два направления, поэтому для «Курса» достаточно одного информативного первого тапа).
  return game.rules.probeMode === "direction" ? Math.min(...shares) : Math.max(...shares);
};

// The bot ties several best cells; a bomb on any of them could open the level with a loss of two moves (у бота бывает несколько равных лучших клеток; бомба на любой из них может начать уровень с потери двух ходов).
export const isBombOnFirstTap = (level: LevelInput) => {
  const { board, rules } = createBoard(level);
  const game = initGame(board, { ...rules, moveLimit: null });
  const scores = scoreCells(createSolver(game, { levelId: level.id, penalty: SOLVER_PENALTY }));
  const best = Math.max(...scores.map(({ score }) => score));
  return scores
    .filter(({ score }) => score >= best - TIE_TOLERANCE)
    .some(({ cell }) => board.bombs.includes(cell));
};
