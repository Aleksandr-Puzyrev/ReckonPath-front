const FIRST_LETTER = "A".charCodeAt(0);

const labelOf = (row: number, col: number) =>
  `${String.fromCharCode(FIRST_LETTER + col)}${row + 1}`;

export const cellsRange = (cells: readonly (readonly [number, number])[]) => {
  if (cells.length === 0) return "";
  const rows = cells.map(([row]) => row);
  const cols = cells.map(([, col]) => col);
  const from = labelOf(Math.min(...rows), Math.min(...cols));
  const to = labelOf(Math.max(...rows), Math.max(...cols));
  return from === to ? from : `${from}–${to}`;
};
