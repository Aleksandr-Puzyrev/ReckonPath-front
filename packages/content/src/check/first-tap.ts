import {
  createBoard,
  createSolver,
  directionOf,
  initGame,
  probeValue,
  scoreCells,
} from "@reckon-path/engine";
import type { GameState, Idx, LevelInput } from "@reckon-path/engine";

const SOLVER_PENALTY = 2;
const TARGET_ANSWER = "target";
const TIE_TOLERANCE = 1e-9;

const largestShare = (answers: readonly string[]) => {
  const groups = new Map<string, number>();
  answers.forEach((answer) => groups.set(answer, (groups.get(answer) ?? 0) + 1));
  return Math.max(...groups.values()) / answers.length;
};

// The answer a tap would give if the targets were these; the engine's own probes keep every mode and the target order right (ответ тапа при таких целях; собственные зонды движка правильно учитывают режим и порядок целей).
const answerOf = (game: GameState, cell: Idx, hypothesis: readonly Idx[]) => {
  if (hypothesis.includes(cell)) return TARGET_ANSWER;
  const context = {
    ...game,
    board: { ...game.board, targets: [...hypothesis] },
    found: new Set<Idx>(),
  };
  return game.rules.probeMode === "direction"
    ? directionOf(context, cell)
    : String(probeValue(context, cell));
};

const solverOf = (level: LevelInput) => {
  const beacons = level.beacons ?? [];
  const { board, rules } = createBoard({ ...level, beacons: [] });
  const game = initGame(board, { ...rules, moveLimit: null });
  const solver = createSolver(game, { levelId: level.id, penalty: SOLVER_PENALTY });
  return { game, solver, beaconCells: beacons.map(([row, col]) => row * board.cols + col) };
};

// Beacons are free first numbers, so on beacon levels they are what must be informative, not a tap (маяки — бесплатные первые числа, поэтому информативны должны быть они, а не тап).
export const firstNumberShare = (level: LevelInput) => {
  const { game, solver, beaconCells } = solverOf(level);
  const { hypotheses } = solver;
  if (beaconCells.length > 0) {
    const candidates = hypotheses.filter(
      (hypothesis) => !hypothesis.some((cell) => beaconCells.includes(cell)),
    );
    return largestShare(
      candidates.map((hypothesis) =>
        beaconCells.map((cell) => answerOf(game, cell, hypothesis)).join(","),
      ),
    );
  }
  const shares = game.board.kinds.flatMap((kind, cell) =>
    kind === "rock"
      ? []
      : [largestShare(hypotheses.map((hypothesis) => answerOf(game, cell, hypothesis)))],
  );
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
