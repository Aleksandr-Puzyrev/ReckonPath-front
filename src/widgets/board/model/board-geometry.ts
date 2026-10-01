import type { Idx } from "@reckon-path/engine";

// Board proportions from the design's board renderer (пропорции поля из отрисовщика поля в дизайне).
const PADDING = 8;
const GAP = { small: 8, medium: 7, large: 6 };
const SMALL_BOARD = 4;
const MEDIUM_BOARD = 5;
const CELL_RADIUS_SHARE = 0.24;
const FRAME_RADIUS = { small: 20, regular: 24 };
const FONT_SHARE = 0.42;
const MIN_FONT = 12;
const MAX_FONT = 26;
const FENCE_LENGTH_SHARE = 0.7;
const FENCE_THICKNESS = { small: 5, regular: 4 };
export const MAX_BOARD_WIDTH = 400;

export interface BoardGeometry {
  rows: number;
  cols: number;
  width: number;
  height: number;
  padding: number;
  gap: number;
  radius: number;
  frameRadius: number;
  cell: number;
  fontSize: number;
  fenceLength: number;
  fenceThickness: number;
}

const gapFor = (size: number) => {
  if (size <= SMALL_BOARD) return GAP.small;
  if (size <= MEDIUM_BOARD) return GAP.medium;
  return GAP.large;
};

export const computeBoardGeometry = (rows: number, cols: number, available: number) => {
  const size = Math.max(rows, cols);
  const padding = PADDING;
  const gap = gapFor(size);
  const width = Math.min(available, MAX_BOARD_WIDTH);
  const cell = (width - 2 * padding - (size - 1) * gap) / size;

  return {
    rows,
    cols,
    width: 2 * padding + cols * cell + (cols - 1) * gap,
    height: 2 * padding + rows * cell + (rows - 1) * gap,
    padding,
    gap,
    radius: Math.round(cell * CELL_RADIUS_SHARE),
    frameRadius: size <= SMALL_BOARD ? FRAME_RADIUS.small : FRAME_RADIUS.regular,
    cell,
    fontSize: Math.min(MAX_FONT, Math.max(MIN_FONT, cell * FONT_SHARE)),
    fenceLength: cell * FENCE_LENGTH_SHARE,
    fenceThickness: size <= MEDIUM_BOARD ? FENCE_THICKNESS.small : FENCE_THICKNESS.regular,
  } satisfies BoardGeometry;
};

export const cellOrigin = (geometry: BoardGeometry, idx: Idx) => {
  "worklet";
  const row = Math.floor(idx / geometry.cols);
  const col = idx % geometry.cols;
  const step = geometry.cell + geometry.gap;
  return { x: geometry.padding + col * step, y: geometry.padding + row * step };
};

const lineIndex = (offset: number, count: number, geometry: BoardGeometry) => {
  // Half of each gap belongs to the cell on either side (половина зазора относится к соседней клетке).
  const index = Math.floor(
    (offset - geometry.padding + geometry.gap / 2) / (geometry.cell + geometry.gap),
  );
  return Math.min(count - 1, Math.max(0, index));
};

export const hitTest = (geometry: BoardGeometry, x: number, y: number): Idx | null => {
  if (x < 0 || y < 0 || x > geometry.width || y > geometry.height) return null;
  return (
    lineIndex(y, geometry.rows, geometry) * geometry.cols + lineIndex(x, geometry.cols, geometry)
  );
};
