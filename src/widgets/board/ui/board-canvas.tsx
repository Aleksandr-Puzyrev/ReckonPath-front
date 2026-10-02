import { Canvas, Group, Picture, createPicture, useFont } from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useDerivedValue } from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";

import type { Board, Idx } from "@reckon-path/engine";

import type { BoardGeometry } from "../model/board-geometry";
import { hitTest } from "../model/board-geometry";
import { createBoardPaths } from "../model/board-paths";
import { createBoardScene } from "../model/board-scene";
import { boardSkinFor } from "../model/board-skin";
import type { CellVisual } from "../model/cell-visuals";
import type { BoardFx } from "../model/use-board-fx";

import { styles } from "./board-styles";
import { drawCellLayer } from "./draw-cell-layer";
import { drawStaticLayer } from "./draw-static-layer";

const LONG_PRESS_MS = 400;
const NO_CELL = -1;
const LABEL_FONT_SHARE = 0.5;
const paths = createBoardPaths();
const numberFontSource = require("@expo-google-fonts/unbounded/800ExtraBold/Unbounded_800ExtraBold.ttf");
const labelFontSource = require("@expo-google-fonts/inter/800ExtraBold/Inter_800ExtraBold.ttf");

interface IBoardCanvas {
  board: Board;
  geometry: BoardGeometry;
  visuals: SharedValue<CellVisual[]>;
  fx: BoardFx;
  onCellPress?: (idx: Idx) => void;
  onCellLongPress?: (idx: Idx) => void;
  isInteractive?: boolean;
}

const ignoreCell = () => undefined;

const BoardCanvas = ({
  board,
  geometry,
  visuals,
  fx,
  onCellPress = ignoreCell,
  onCellLongPress = ignoreCell,
  isInteractive = true,
}: IBoardCanvas) => {
  const { rt } = useUnistyles();
  const numberFont = useFont(numberFontSource, geometry.fontSize);
  const labelFont = useFont(labelFontSource, geometry.fontSize * LABEL_FONT_SHARE);
  const scene = createBoardScene(board, geometry, {
    skin: boardSkinFor(rt.themeName === "light" ? "light" : "dark"),
    paths,
    font: numberFont,
    labelFont,
  });
  const staticPicture = createPicture((canvas) => drawStaticLayer(canvas, scene));

  const cellPicture = useDerivedValue(() =>
    createPicture((canvas) =>
      drawCellLayer(canvas, scene, visuals.value, {
        popCell: fx.popCell.value,
        pop: fx.pop.value,
        shakeCell: fx.shakeCell.value,
        cellShake: fx.cellShake.value,
        pressedCell: fx.pressedCell.value,
      }),
    ),
  );
  const shakeTransform = useDerivedValue(() => [{ translateX: fx.boardShake.value }]);

  const cellAt = (x: number, y: number) => hitTest(geometry, x, y);

  const tap = Gesture.Tap()
    .runOnJS(true)
    .maxDistance(geometry.cell / 2)
    .onBegin(({ x, y }) => {
      fx.pressedCell.set(cellAt(x, y) ?? NO_CELL);
    })
    .onEnd(({ x, y }, isSuccess) => {
      const idx = cellAt(x, y);
      if (isSuccess && idx !== null) onCellPress(idx);
    })
    .onFinalize(() => {
      fx.pressedCell.set(NO_CELL);
    });
  const longPress = Gesture.LongPress()
    .runOnJS(true)
    .minDuration(LONG_PRESS_MS)
    .onStart(({ x, y }) => {
      const idx = cellAt(x, y);
      if (idx !== null) onCellLongPress(idx);
    });

  const canvas = (
    <Canvas style={styles.canvas}>
      <Group transform={shakeTransform}>
        <Picture picture={staticPicture} />
        <Picture picture={cellPicture} />
      </Group>
    </Canvas>
  );
  if (!isInteractive) return canvas;

  return <GestureDetector gesture={Gesture.Exclusive(longPress, tap)}>{canvas}</GestureDetector>;
};

export default BoardCanvas;
