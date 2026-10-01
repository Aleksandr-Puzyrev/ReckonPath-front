import type { Board, Cell, CellKind, Direction, EdgeKey, Idx } from "../model/types";

export const UNREACHABLE = 0x7fff;

const EDGE_KEY_BASE = 128;

export const toIdx = (cols: number, [row, col]: Cell): Idx => row * cols + col;

export const cellKey = ([row, col]: readonly [number, number]) => `${row},${col}`;

export const toCell = (cols: number, idx: Idx): Cell => [Math.floor(idx / cols), idx % cols];

export const edgeKey = (a: Idx, b: Idx): EdgeKey => Math.min(a, b) * EDGE_KEY_BASE + Math.max(a, b);

export const isInside = (rows: number, cols: number, [row, col]: Cell) =>
  Number.isInteger(row) &&
  Number.isInteger(col) &&
  row >= 0 &&
  row < rows &&
  col >= 0 &&
  col < cols;

const DIRECTION_OFFSETS: readonly (readonly [Direction, number, number])[] = [
  ["N", -1, 0],
  ["E", 0, 1],
  ["S", 1, 0],
  ["W", 0, -1],
];

export const gridNeighbors = (board: Pick<Board, "rows" | "cols">, idx: Idx) => {
  const [row, col] = toCell(board.cols, idx);
  const result: { dir: Direction; idx: Idx }[] = [];

  DIRECTION_OFFSETS.forEach(([dir, dRow, dCol]) => {
    const next: Cell = [row + dRow, col + dCol];
    if (isInside(board.rows, board.cols, next)) result.push({ dir, idx: toIdx(board.cols, next) });
  });

  return result;
};

export const passableNeighbors = (board: Board, idx: Idx) =>
  gridNeighbors(board, idx).filter(
    (neighbor) =>
      board.kinds[neighbor.idx] !== "rock" && !board.fences.has(edgeKey(idx, neighbor.idx)),
  );

const ENTER_COST: Record<Exclude<CellKind, "rock">, number> = {
  open: 1,
  stream: 3,
  heavy: 2,
};

export const enterCost = (board: Board, idx: Idx) => {
  const kind = board.kinds[idx];
  if (kind === undefined || kind === "rock") return UNREACHABLE;
  if (kind === "stream" && board.bridges.has(idx)) return 1;

  return ENTER_COST[kind];
};

export const cellCount = (board: Pick<Board, "rows" | "cols">) => board.rows * board.cols;
