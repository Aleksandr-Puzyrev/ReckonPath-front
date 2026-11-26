import type { SkCanvas } from "@shopify/react-native-skia";

import { cellOrigin } from "../model/board-geometry";
import type { BoardScene } from "../model/board-scene";

import {
  diagonalGradient,
  drawCenteredText,
  drawTexture,
  glowPaint,
  roundRect,
  solidPaint,
} from "./draw-helpers";

const CELL_THICKNESS = 4;
const BRIDGE_BORDER = 2;
const FENCE_GLOW = 5;
const HEAVY_LABEL_INSET = 0.2;
const HEAVY_LABEL_ALPHA = 0.8;

const cellColors = (scene: BoardScene, idx: number) => {
  "worklet";
  const { elements } = scene.skin;
  const kind = scene.kinds[idx];
  if (kind === "rock") return { top: elements.rock, side: elements.rockSide };
  if (kind === "heavy") return { top: elements.heavy, side: elements.heavySide };
  if (kind === "stream" && scene.bridges[idx] === true) {
    return { top: elements.bridge, side: elements.bridgeSide };
  }
  if (kind === "stream") return { top: elements.stream, side: elements.streamSide };
  return { top: scene.skin.cell, side: scene.skin.cellSide };
};

const cellTexture = (scene: BoardScene, idx: number) => {
  "worklet";
  const textures = scene.textures;
  switch (scene.kinds[idx]) {
    case "rock":
      return textures?.rock;
    case "heavy":
      return textures?.heavy;
    case "stream":
      return scene.bridges[idx] ? textures?.bridge : textures?.water;
    default:
      return textures?.cell;
  }
};

const drawCell = (canvas: SkCanvas, scene: BoardScene, idx: number) => {
  "worklet";
  const { cell, radius } = scene.geometry;
  const { x, y } = cellOrigin(scene.geometry, idx);
  const { top, side } = cellColors(scene, idx);

  canvas.drawRRect(roundRect(x, y + CELL_THICKNESS, cell, cell, radius), solidPaint(side));
  canvas.drawRRect(roundRect(x, y, cell, cell, radius), diagonalGradient(x, y, cell, top));

  const hasTexture = drawTexture(
    canvas,
    cellTexture(scene, idx),
    { x, y, width: cell, height: cell },
    radius,
  );
  if (!hasTexture && scene.kinds[idx] === "stream" && scene.bridges[idx] === true) {
    const border = solidPaint(scene.skin.elements.bridgeBorder);
    canvas.drawRect({ x, y, width: cell, height: BRIDGE_BORDER }, border);
    canvas.drawRect({ x, y: y + cell - BRIDGE_BORDER, width: cell, height: BRIDGE_BORDER }, border);
  }
  if (scene.kinds[idx] === "heavy" && scene.labelFont !== null) {
    const inset = cell * HEAVY_LABEL_INSET;
    drawCenteredText(
      canvas,
      "×2",
      x + inset,
      y + inset,
      scene.labelFont,
      solidPaint(scene.skin.elements.heavyText, HEAVY_LABEL_ALPHA),
    );
  }
};

export const drawStaticLayer = (canvas: SkCanvas, scene: BoardScene) => {
  "worklet";
  const { width, height, frameRadius } = scene.geometry;
  canvas.drawRRect(
    roundRect(0, 0, width, height, frameRadius),
    diagonalGradient(0, 0, Math.max(width, height), scene.skin.frame),
  );
  drawTexture(canvas, scene.textures?.bg, { x: 0, y: 0, width, height }, frameRadius);
  scene.kinds.forEach((_, idx) => drawCell(canvas, scene, idx));

  const glow = glowPaint(scene.skin.elements.fence, FENCE_GLOW);
  const bar = solidPaint(scene.skin.elements.fence);
  scene.fences.forEach((fence) => {
    if (drawTexture(canvas, scene.textures?.fence, fence)) return;
    const rect = roundRect(
      fence.x,
      fence.y,
      fence.width,
      fence.height,
      Math.min(fence.width, fence.height) / 2,
    );
    canvas.drawRRect(rect, glow);
    canvas.drawRRect(rect, bar);
  });
};
