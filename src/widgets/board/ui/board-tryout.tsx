import { useState } from "react";
import { View } from "react-native";
import { useSharedValue } from "react-native-reanimated";

import { createBoard } from "@reckon-path/engine";
import type { Idx, LevelInput } from "@reckon-path/engine";

import { computeBoardGeometry } from "../model/board-geometry";
import type { CellVisual } from "../model/cell-visuals";
import { tryoutVisualsOf } from "../model/tryout-visuals";
import type { BoardLook } from "../model/use-board-skin";
import { useBoardFx } from "../model/use-board-fx";

import BoardCanvas from "./board-canvas";
import { styles } from "./board-styles";

interface IBoardTryout {
  level: LevelInput;
  size: number;
  look: BoardLook;
}

// A board to try a skin on: taps open cells with their numbers and nothing is saved (поле, чтобы примерить скин: тапы открывают клетки с числами, ничего не сохраняется).
const BoardTryout = ({ level, size, look }: IBoardTryout) => {
  const { board } = createBoard(level);
  const geometry = computeBoardGeometry(board.rows, board.cols, size);
  const [taps, setTaps] = useState<Idx[]>([]);
  const visuals = useSharedValue<CellVisual[]>(tryoutVisualsOf(level, []));
  const fx = useBoardFx();

  const handleCellPress = (cell: Idx) => {
    if (taps.includes(cell)) return;
    const next = [...taps, cell];
    setTaps(next);
    visuals.set(tryoutVisualsOf(level, next));
  };

  return (
    <View
      testID="board-tryout"
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
        onCellPress={handleCellPress}
      />
    </View>
  );
};

export default BoardTryout;
