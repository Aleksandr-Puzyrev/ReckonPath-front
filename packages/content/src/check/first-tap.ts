import { createBoard, createSolver, initGame } from "@reckon-path/engine";
import type { LevelInput } from "@reckon-path/engine";

const SOLVER_PENALTY = 2;
const TARGET_ANSWER = -1;

const largestShare = (answers: readonly string[]) => {
  const groups = new Map<string, number>();
  answers.forEach((answer) => groups.set(answer, (groups.get(answer) ?? 0) + 1));
  return Math.max(...groups.values()) / answers.length;
};

// Beacons are free first numbers, so on beacon levels they are what must be informative, not a tap (маяки — бесплатные первые числа, поэтому информативны должны быть они, а не тап).
export const firstNumberShare = (level: LevelInput) => {
  const beacons = level.beacons ?? [];
  const { board, rules } = createBoard({ ...level, beacons: [] });
  const game = initGame(board, { ...rules, moveLimit: null });
  const { hypotheses } = createSolver(game, { levelId: level.id, penalty: SOLVER_PENALTY });
  const size = board.kinds.length;
  const answerAt = (cell: number, hypothesis: readonly number[]) =>
    hypothesis.includes(cell)
      ? TARGET_ANSWER
      : Math.min(...hypothesis.map((target) => game.dist[cell * size + target] ?? Infinity));

  const beaconCells = beacons.map(([row, col]) => row * board.cols + col);
  const candidates = hypotheses.filter(
    (hypothesis) => !hypothesis.some((cell) => beaconCells.includes(cell)),
  );
  if (beaconCells.length > 0) {
    return largestShare(
      candidates.map((hypothesis) =>
        beaconCells.map((cell) => answerAt(cell, hypothesis)).join(","),
      ),
    );
  }

  return Math.max(
    ...board.kinds.flatMap((kind, cell) =>
      kind === "rock"
        ? []
        : [largestShare(hypotheses.map((hypothesis) => String(answerAt(cell, hypothesis))))],
    ),
  );
};
