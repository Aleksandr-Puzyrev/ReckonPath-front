import { ClipOp, Skia } from "@shopify/react-native-skia";
import type { SkCanvas } from "@shopify/react-native-skia";

import { cellOrigin } from "../model/board-geometry";
import type { BoardScene } from "../model/board-scene";
import type { CellVisual } from "../model/cell-visuals";

import {
  diagonalGradient,
  drawCenteredText,
  drawIcon,
  radialGradient,
  roundRect,
  solidPaint,
  strokePaint,
} from "./draw-helpers";

export interface CellFx {
  popCell: number;
  pop: number;
  shakeCell: number;
  cellShake: number;
  pressedCell: number;
}

const HEAT_WIDTH = { hot: 3, warm: 2, cold: 1 } as const;
const RING_WIDTH = 2;
const STALE_ALPHA = 0.45;
const GHOST_ALPHA = 0.55;
const FOG_DOT = 3.5;
const ARROW_SHARE = 0.6;
const MINE_SHARE = 0.56;
const BADGE_SHARE = 0.27;
const BADGE_INSET = 3;
const PIN_SHARE = 0.22;
const PIN_DOT_SHARE = 0.35;
const TARGET_RING_SHARE = 0.36;
const ORDER_SHARE = 0.36;
const TOWER_SHARE = 0.34;
const BUOY_SHARE = 0.14;
const PLAQUE_PADDING = 6;
const FLAG_POLE = 2;
const FLAG_PENNANT = { width: 0.62, height: 0.52 };
const FLAG_LEFT_SHARE = 1 / 3;
const DIRECTION_ANGLE = { N: 0, E: 90, S: 180, W: 270 } as const;
const COMPARE_BAR = { width: 0.42, height: 0.08, gap: 0.08 };
const MINE_CORE = { cx: 12, cy: 12, r: 6.6 };
const MINE_SHINE = { cx: 9.8, cy: 9.6, r: 1.9, alpha: 0.5 };
const MINE_STROKE = 2.4;

const drawMine = (
  canvas: SkCanvas,
  scene: BoardScene,
  x: number,
  y: number,
  size: number,
  color: string,
  alpha: number,
) => {
  "worklet";
  const { paths } = scene;
  drawIcon(canvas, paths.mineSpikes, paths.box, x, y, size, strokePaint(color, MINE_STROKE, alpha));
  const scale = size / paths.box;
  canvas.drawCircle(
    x + MINE_CORE.cx * scale,
    y + MINE_CORE.cy * scale,
    MINE_CORE.r * scale,
    solidPaint(color, alpha),
  );
  canvas.drawCircle(
    x + MINE_SHINE.cx * scale,
    y + MINE_SHINE.cy * scale,
    MINE_SHINE.r * scale,
    solidPaint(scene.skin.elements.pinDot, MINE_SHINE.alpha * alpha),
  );
};

const drawPin = (canvas: SkCanvas, scene: BoardScene, cx: number, cy: number, alpha: number) => {
  "worklet";
  const radius = scene.geometry.cell * PIN_SHARE;
  const paint = radialGradient(cx, cy, radius, scene.skin.elements.pin);
  paint.setAlphaf(alpha);
  canvas.drawCircle(cx, cy, radius, paint);
  canvas.drawCircle(cx, cy, radius * PIN_DOT_SHARE, solidPaint(scene.skin.elements.pinDot, alpha));
};

const drawFlag = (canvas: SkCanvas, scene: BoardScene, cx: number, cy: number) => {
  "worklet";
  const size = scene.geometry.fontSize;
  const left = cx - size * FLAG_LEFT_SHARE;
  const top = cy - size / 2;
  canvas.drawRect(
    { x: left, y: top, width: FLAG_POLE, height: size },
    solidPaint(scene.skin.elements.flagPole),
  );
  const pennant = Skia.PathBuilder.Make()
    .moveTo(left + FLAG_POLE, top)
    .lineTo(left + FLAG_POLE + size * FLAG_PENNANT.width, top + (size * FLAG_PENNANT.height) / 2)
    .lineTo(left + FLAG_POLE, top + size * FLAG_PENNANT.height)
    .close()
    .build();
  canvas.drawPath(pennant, solidPaint(scene.skin.elements.flag));
};

const drawAnswer = (
  canvas: SkCanvas,
  scene: BoardScene,
  visual: CellVisual,
  idx: number,
  x: number,
  y: number,
) => {
  "worklet";
  const { cell, radius } = scene.geometry;
  const { content } = visual;
  const { elements } = scene.skin;
  const cx = x + cell / 2;
  const cy = y + cell / 2;
  const alpha = visual.isStale ? STALE_ALPHA : 1;
  const color = visual.isStale ? scene.skin.muted : scene.skin.number;

  if (content.type === "distance") {
    if (!visual.isStale) {
      const width = HEAT_WIDTH[content.heat];
      canvas.drawRRect(
        roundRect(x + width / 2, y + width / 2, cell - width, cell - width, radius),
        strokePaint(elements.heat[content.heat], width),
      );
    }
    if (scene.font === null) return;
    const text = String(content.value);
    const kind = scene.kinds[idx];
    if (kind === "stream") {
      const textWidth = scene.font.measureText(text).width + 2 * PLAQUE_PADDING;
      const height = scene.geometry.fontSize + PLAQUE_PADDING;
      canvas.drawRRect(
        roundRect(cx - textWidth / 2, cy - height / 2, textWidth, height, PLAQUE_PADDING),
        solidPaint(elements.plaque),
      );
      drawCenteredText(canvas, text, cx, cy, scene.font, solidPaint(elements.plaqueText, alpha));
      return;
    }
    const textColor = kind === "heavy" ? elements.heavyText : color;
    drawCenteredText(canvas, text, cx, cy, scene.font, solidPaint(textColor, alpha));
    return;
  }

  if (content.type === "direction") {
    const size = cell * ARROW_SHARE;
    canvas.save();
    canvas.rotate(DIRECTION_ANGLE[content.dir], cx, cy);
    drawIcon(
      canvas,
      scene.paths.arrow,
      scene.paths.box,
      cx - size / 2,
      cy - size / 2,
      size,
      solidPaint(color, alpha),
    );
    canvas.restore();
    return;
  }

  if (content.type === "hotcold") {
    const size = cell * ARROW_SHARE;
    if (content.cmp === "warmer" || content.cmp === "colder") {
      const tone = visual.isStale ? scene.skin.muted : elements.compare[content.cmp];
      canvas.save();
      if (content.cmp === "colder") canvas.rotate(DIRECTION_ANGLE.S, cx, cy);
      drawIcon(
        canvas,
        scene.paths.arrow,
        scene.paths.box,
        cx - size / 2,
        cy - size / 2,
        size,
        solidPaint(tone, alpha),
      );
      canvas.restore();
      return;
    }
    const barWidth = cell * COMPARE_BAR.width;
    const barHeight = cell * COMPARE_BAR.height;
    const offsets =
      content.cmp === "same" ? [-cell * COMPARE_BAR.gap, cell * COMPARE_BAR.gap] : [0];
    offsets.forEach((offset) => {
      canvas.drawRRect(
        roundRect(
          cx - barWidth / 2,
          cy + offset - barHeight / 2,
          barWidth,
          barHeight,
          barHeight / 2,
        ),
        solidPaint(scene.skin.muted, alpha),
      );
    });
  }
};

const drawRevealed = (
  canvas: SkCanvas,
  scene: BoardScene,
  visual: CellVisual,
  idx: number,
  x: number,
  y: number,
) => {
  "worklet";
  const { cell, radius } = scene.geometry;
  const { elements } = scene.skin;
  const { content } = visual;
  const cx = x + cell / 2;
  const cy = y + cell / 2;

  if (content.type === "target") {
    canvas.drawRRect(
      roundRect(x, y, cell, cell, radius),
      diagonalGradient(x, y, cell, elements.target),
    );
    canvas.drawCircle(
      cx,
      cy,
      cell * TARGET_RING_SHARE,
      strokePaint(elements.targetRing, RING_WIDTH),
    );
    drawPin(canvas, scene, cx, cy, 1);
    if (content.order !== null && scene.labelFont !== null) {
      const size = cell * ORDER_SHARE;
      canvas.drawCircle(
        x + BADGE_INSET + size / 2,
        y + BADGE_INSET + size / 2,
        size / 2,
        solidPaint(elements.orderBadge),
      );
      drawCenteredText(
        canvas,
        String(content.order),
        x + BADGE_INSET + size / 2,
        y + BADGE_INSET + size / 2,
        scene.labelFont,
        solidPaint(elements.orderText),
      );
    }
    return;
  }
  if (content.type === "bomb") {
    canvas.drawRRect(
      roundRect(x, y, cell, cell, radius),
      radialGradient(cx, cy, cell / 2, elements.burn),
    );
    const size = cell * MINE_SHARE;
    drawMine(canvas, scene, cx - size / 2, cy - size / 2, size, elements.mine, 1);
    return;
  }

  if (scene.kinds[idx] === "open") {
    canvas.drawRRect(roundRect(x, y, cell, cell, radius), solidPaint(scene.skin.revealedTint));
  }
  if (visual.isFogged) {
    canvas.drawRRect(roundRect(x, y, cell, cell, radius), solidPaint(elements.fog));
    canvas.drawCircle(cx, cy, FOG_DOT, solidPaint(scene.skin.muted));
  } else {
    drawAnswer(canvas, scene, visual, idx, x, y);
  }
  if (visual.isBeacon) {
    canvas.drawRRect(
      roundRect(
        x + RING_WIDTH / 2,
        y + RING_WIDTH / 2,
        cell - RING_WIDTH,
        cell - RING_WIDTH,
        radius,
      ),
      strokePaint(elements.beaconRing, RING_WIDTH),
    );
    const size = cell * TOWER_SHARE;
    drawIcon(
      canvas,
      scene.paths.beaconTower,
      scene.paths.box,
      x + BADGE_INSET,
      y + BADGE_INSET,
      size,
      solidPaint(elements.beaconTower),
    );
  }
  if (visual.isBuoy) {
    const r = cell * BUOY_SHARE;
    const [top = "", bottom = ""] = elements.buoy;
    canvas.drawCircle(x + BADGE_INSET + r, y + BADGE_INSET + r, r, solidPaint(bottom));
    canvas.save();
    canvas.clipRect(
      { x: x + BADGE_INSET, y: y + BADGE_INSET, width: 2 * r, height: r },
      ClipOp.Intersect,
      true,
    );
    canvas.drawCircle(x + BADGE_INSET + r, y + BADGE_INSET + r, r, solidPaint(top));
    canvas.restore();
  }
};

const drawCell = (
  canvas: SkCanvas,
  scene: BoardScene,
  visual: CellVisual,
  idx: number,
  fx: CellFx,
) => {
  "worklet";
  const { cell, radius } = scene.geometry;
  const origin = cellOrigin(scene.geometry, idx);
  const x = origin.x + (idx === fx.shakeCell ? fx.cellShake : 0);
  const y = origin.y;
  const cx = x + cell / 2;
  const cy = y + cell / 2;
  const { content } = visual;
  const { elements } = scene.skin;

  canvas.save();
  if (idx === fx.popCell) {
    canvas.translate(cx, cy);
    canvas.scale(fx.pop, fx.pop);
    canvas.translate(-cx, -cy);
  }

  if (content.type === "hidden") {
    if (content.hasFlag) drawFlag(canvas, scene, cx, cy);
    if (content.ghost === "target") drawPin(canvas, scene, cx, cy, GHOST_ALPHA);
    if (content.ghost === "bomb") {
      const size = cell * MINE_SHARE;
      drawMine(canvas, scene, cx - size / 2, cy - size / 2, size, elements.mineBadge, GHOST_ALPHA);
    }
    if (idx === fx.pressedCell)
      canvas.drawRRect(roundRect(x, y, cell, cell, radius), solidPaint(scene.skin.pressedTint));
  } else {
    drawRevealed(canvas, scene, visual, idx, x, y);
  }

  if (visual.hasBombNear) {
    const size = cell * BADGE_SHARE;
    drawMine(
      canvas,
      scene,
      x + cell - size - BADGE_INSET,
      y + BADGE_INSET,
      size,
      elements.mineBadge,
      1,
    );
  }
  if (visual.isLast && content.type !== "target") {
    canvas.drawRRect(
      roundRect(
        x + RING_WIDTH,
        y + RING_WIDTH,
        cell - 2 * RING_WIDTH,
        cell - 2 * RING_WIDTH,
        radius,
      ),
      strokePaint(elements.lastRing, RING_WIDTH),
    );
  }
  canvas.restore();
};

export const drawCellLayer = (
  canvas: SkCanvas,
  scene: BoardScene,
  visuals: readonly CellVisual[],
  fx: CellFx,
) => {
  "worklet";
  visuals.forEach((visual, idx) => drawCell(canvas, scene, visual, idx, fx));
};
