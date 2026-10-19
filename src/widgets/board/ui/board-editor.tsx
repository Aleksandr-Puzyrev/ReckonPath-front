import { useEffect } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";

import { createBoard } from "@reckon-path/engine";
import type { Idx, LevelInput } from "@reckon-path/engine";

import { computeBoardGeometry, edgeHitTest, hitTest } from "../model/board-geometry";
import type { CellVisual } from "../model/cell-visuals";
import { mapPreviewVisualsOf } from "../model/map-preview-visuals";
import type { BoardFx } from "../model/use-board-fx";
import type { BoardLook } from "../model/use-board-skin";

import BoardCanvas from "./board-canvas";
import BoardCoordinates from "./board-coordinates";
import { styles } from "./board-styles";

export type EditorGesture = "cell" | "edge";

interface IBoardEditor {
  level: LevelInput;
  size: number;
  look?: BoardLook;
  fx: BoardFx;
  gesture: EditorGesture;
  taps: readonly Idx[];
  errors: readonly Idx[];
  onStrokeStart: () => void;
  onStrokeCell: (idx: Idx, index: number) => void;
  onStrokeEdge: (edge: [Idx, Idx], index: number) => void;
  onStrokeEnd: () => void;
}

const NONE = -1;

const edgeKeyOf = ([a, b]: [Idx, Idx], cells: number) => a * cells + b;

// One pan covers a tap and a drag: the first visited cell or edge is the tap, the rest paint (одно панорамирование покрывает и тап, и протяжку: первая клетка или ребро — тап, остальные рисуют).
const BoardEditor = ({
  level,
  size,
  look,
  fx,
  gesture,
  taps,
  errors,
  onStrokeStart,
  onStrokeCell,
  onStrokeEdge,
  onStrokeEnd,
}: IBoardEditor) => {
  const { board } = createBoard(level);
  const geometry = computeBoardGeometry(board.rows, board.cols, size);
  const cells = mapPreviewVisualsOf(level, taps, errors);
  const visuals = useSharedValue<CellVisual[]>(cells);
  const last = useSharedValue(NONE);
  const count = useSharedValue(0);

  useEffect(() => {
    visuals.set(cells);
  }, [visuals, cells]);

  const visit = (x: number, y: number) => {
    if (gesture === "cell") {
      const idx = hitTest(geometry, x, y);
      if (idx === null || idx === last.get()) return;
      last.set(idx);
      onStrokeCell(idx, count.get());
    } else {
      const edge = edgeHitTest(geometry, x, y);
      if (edge === null) return;
      const key = edgeKeyOf(edge, board.rows * board.cols);
      if (key === last.get()) return;
      last.set(key);
      onStrokeEdge(edge, count.get());
    }
    count.set(count.get() + 1);
  };

  const pan = Gesture.Pan()
    .runOnJS(true)
    .minDistance(0)
    .onBegin(({ x, y }) => {
      last.set(NONE);
      count.set(0);
      onStrokeStart();
      visit(x, y);
    })
    .onUpdate(({ x, y }) => visit(x, y))
    .onFinalize(onStrokeEnd);

  return (
    <BoardCoordinates geometry={geometry}>
      <GestureDetector gesture={pan}>
        <View
          testID="board-editor"
          style={[
            styles.board,
            { width: geometry.width, height: geometry.height, borderRadius: geometry.frameRadius },
          ]}
        >
          <BoardCanvas
            board={board}
            geometry={geometry}
            visuals={visuals}
            fx={fx}
            look={look}
            isInteractive={false}
          />
        </View>
      </GestureDetector>
    </BoardCoordinates>
  );
};

export default BoardEditor;
