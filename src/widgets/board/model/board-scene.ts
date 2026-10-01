import type { SkFont } from "@shopify/react-native-skia";

import type { Board } from "@reckon-path/engine";

import type { BoardGeometry } from "./board-geometry";
import { cellOrigin } from "./board-geometry";
import type { BoardPaths } from "./board-paths";
import type { BoardSkin } from "./board-skin";

const EDGE_KEY_BASE = 128;

export interface FenceRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BoardScene {
  geometry: BoardGeometry;
  kinds: readonly string[];
  bridges: readonly boolean[];
  fences: readonly FenceRect[];
  skin: BoardSkin;
  paths: BoardPaths;
  font: SkFont | null;
  labelFont: SkFont | null;
}

const fenceRect = (geometry: BoardGeometry, key: number): FenceRect => {
  const first = Math.floor(key / EDGE_KEY_BASE);
  const second = key % EDGE_KEY_BASE;
  const origin = cellOrigin(geometry, first);
  const { cell, gap, fenceLength, fenceThickness } = geometry;
  const inset = (cell - fenceLength) / 2;
  const middle = cell + gap / 2 - fenceThickness / 2;

  if (second === first + 1) {
    return {
      x: origin.x + middle,
      y: origin.y + inset,
      width: fenceThickness,
      height: fenceLength,
    };
  }
  return { x: origin.x + inset, y: origin.y + middle, width: fenceLength, height: fenceThickness };
};

export const createBoardScene = (
  board: Board,
  geometry: BoardGeometry,
  assets: Pick<BoardScene, "skin" | "paths" | "font" | "labelFont">,
): BoardScene => ({
  geometry,
  kinds: board.kinds,
  bridges: board.kinds.map((_, idx) => board.bridges.has(idx)),
  fences: [...board.fences].map((key) => fenceRect(geometry, key)),
  ...assets,
});
