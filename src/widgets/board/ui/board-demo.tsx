import { View } from "react-native";
import { useSharedValue } from "react-native-reanimated";

import { applyTap, createBoard, initGame } from "@reckon-path/engine";
import type { Idx, LevelInput } from "@reckon-path/engine";

import { computeBoardGeometry } from "../model/board-geometry";
import { buildCellVisuals } from "../model/cell-visuals";
import type { CellVisual } from "../model/cell-visuals";
import { useBoardFx } from "../model/use-board-fx";

import BoardCanvas from "./board-canvas";
import { styles } from "./board-styles";

interface IBoardDemo {
  level: LevelInput;
  taps: readonly Idx[];
  flags?: readonly Idx[];
  highlight?: readonly Idx[];
  size: number;
}

const BoardDemo = ({ level, taps, flags = [], highlight, size }: IBoardDemo) => {
  const { board, rules } = createBoard(level);
  const game = taps.reduce((state, cell) => applyTap(state, cell).state, initGame(board, rules));
  const geometry = computeBoardGeometry(board.rows, board.cols, size);
  const visuals = useSharedValue<CellVisual[]>(
    buildCellVisuals(game, { flags, lastCell: taps.at(-1) ?? null, showHidden: false, highlight }),
  );
  const fx = useBoardFx();

  return (
    <View
      importantForAccessibility="no-hide-descendants"
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
        isInteractive={false}
      />
    </View>
  );
};

export default BoardDemo;
