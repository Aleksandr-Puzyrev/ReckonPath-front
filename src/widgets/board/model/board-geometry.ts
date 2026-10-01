import type { Idx } from "@reckon-path/engine";

interface SizeLayout {
  padding: number;
  gap: number;
  radius: number;
}

// Frame padding, cell gap, and cell radius by board size (отступ рамки, зазор и радиус клетки по размеру поля).
const LAYOUT_BY_SIZE: Record<number, SizeLayout> = {
  4: { padding: 10, gap: 8, radius: 16 },
  5: { padding: 10, gap: 6, radius: 14 },
  6: { padding: 8, gap: 6, radius: 12 },
  7: { padding: 8, gap: 5, radius: 12 },
  8: { padding: 8, gap: 4, radius: 10 },
  9: { padding: 6, gap: 4, radius: 9 },
};

const DEFAULT_LAYOUT: SizeLayout = { padding: 6, gap: 4, radius: 9 };
const FONT_SHARE = 0.45;
const MIN_FONT = 14;
const MAX_FONT = 28;
const FENCE_LENGTH_SHARE = 0.7;
const FENCE_THICKNESS = { small: 5, regular: 4, large: 3 };
export const MAX_BOARD_WIDTH = 400;

export interface BoardGeometry {
  rows: number;
  cols: number;
  width: number;
  height: number;
  padding: number;
  gap: number;
  radius: number;
  cell: number;
  fontSize: number;
  fenceLength: number;
  fenceThickness: number;
}

const fenceThicknessFor = (size: number) => {
  if (size <= 5) return FENCE_THICKNESS.small;
  if (size >= 9) return FENCE_THICKNESS.large;
  return FENCE_THICKNESS.regular;
};

export const computeBoardGeometry = (rows: number, cols: number, available: number) => {
  const size = Math.max(rows, cols);
  const { padding, gap, radius } = LAYOUT_BY_SIZE[size] ?? DEFAULT_LAYOUT;
  const width = Math.min(available, MAX_BOARD_WIDTH);
  const cell = (width - 2 * padding - (size - 1) * gap) / size;

  return {
    rows,
    cols,
    width: 2 * padding + cols * cell + (cols - 1) * gap,
    height: 2 * padding + rows * cell + (rows - 1) * gap,
    padding,
    gap,
    radius,
    cell,
    fontSize: Math.min(MAX_FONT, Math.max(MIN_FONT, cell * FONT_SHARE)),
    fenceLength: cell * FENCE_LENGTH_SHARE,
    fenceThickness: fenceThicknessFor(size),
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
