import type { Fence, Point } from "../model/types";

export const colGapWall = (size: number, col: number, gapRow: number): Fence[] =>
  Array.from({ length: size }, (_, row) => row)
    .filter((row) => row !== gapRow)
    .map((row) => [
      [row, col],
      [row, col + 1],
    ]);

export const rowGapWall = (size: number, row: number, gapCol: number): Fence[] =>
  Array.from({ length: size }, (_, col) => col)
    .filter((col) => col !== gapCol)
    .map((col) => [
      [row, col],
      [row + 1, col],
    ]);

export const zigzagWalls = (size: number, colA: number, colB: number, splitRow: number): Fence[] =>
  Array.from({ length: size }, (_, row) => {
    const col = row < splitRow ? colA : colB;
    return [
      [row, col],
      [row, col + 1],
    ];
  });

export const streamColumn = (rowStart: number, rowEnd: number, col: number): Point[] =>
  Array.from({ length: rowEnd - rowStart + 1 }, (_, offset) => [rowStart + offset, col]);

export const streamRow = (colStart: number, colEnd: number, row: number): Point[] =>
  Array.from({ length: colEnd - colStart + 1 }, (_, offset) => [row, colStart + offset]);
