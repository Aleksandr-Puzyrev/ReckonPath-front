import type { Idx } from "@reckon-path/engine";

const COLUMN_LETTERS = "ABCDEFGHI";

export const cellLabel = (cols: number, idx: Idx) =>
  `${COLUMN_LETTERS[idx % cols] ?? ""}${Math.floor(idx / cols) + 1}`;
