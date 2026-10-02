import { toIdx } from "@reckon-path/engine";
import type { Board, Idx } from "@reckon-path/engine";

export type TutorialStep = "tapFirst" | "explainNumber" | "tapCloser" | "findAlone";

const NEIGHBOURS = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
] as const;

export const closerCells = (board: Board, cell: Idx): Idx[] => {
  const row = Math.floor(cell / board.cols);
  const col = cell % board.cols;
  return NEIGHBOURS.flatMap(([dRow, dCol]) => {
    const next: [number, number] = [row + dRow, col + dCol];
    const isInside = next[0] >= 0 && next[0] < board.rows && next[1] >= 0 && next[1] < board.cols;
    if (!isInside) return [];
    const idx = toIdx(board.cols, next);
    return board.kinds[idx] === "rock" ? [] : [idx];
  });
};

export const highlightOf = (step: TutorialStep, board: Board, firstCell: Idx): Idx[] | null => {
  if (step === "tapFirst" || step === "explainNumber") return [firstCell];
  if (step === "tapCloser") return closerCells(board, firstCell);
  return null;
};

export const isTapAllowed = (step: TutorialStep, board: Board, firstCell: Idx, cell: Idx) => {
  if (step === "explainNumber") return false;
  const highlight = highlightOf(step, board, firstCell);
  return highlight === null || highlight.includes(cell);
};

export const stepAfterTap = (step: TutorialStep): TutorialStep => {
  if (step === "tapFirst") return "explainNumber";
  if (step === "tapCloser") return "findAlone";
  return step;
};

export const canSkip = (step: TutorialStep) => step !== "findAlone";
