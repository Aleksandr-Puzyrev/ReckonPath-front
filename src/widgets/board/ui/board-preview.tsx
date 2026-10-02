import { View } from "react-native";
import { useSharedValue } from "react-native-reanimated";

import { createBoard } from "@reckon-path/engine";
import type { LevelInput } from "@reckon-path/engine";

import { computeBoardGeometry } from "../model/board-geometry";
import type { CellVisual } from "../model/cell-visuals";
import { useBoardFx } from "../model/use-board-fx";

import BoardCanvas from "./board-canvas";
import { styles } from "./board-styles";

interface IBoardPreview {
  level: LevelInput;
  size: number;
}

const CLOSED_CELL: CellVisual = {
  content: { type: "hidden", hasFlag: false, ghost: null },
  emphasis: "none",
  isStale: false,
  isFogged: false,
  isLast: false,
  hasBombNear: false,
  isBeacon: false,
  isBuoy: false,
};

const BoardPreview = ({ level, size }: IBoardPreview) => {
  const { board } = createBoard(level);
  const geometry = computeBoardGeometry(board.rows, board.cols, size);
  const visuals = useSharedValue<CellVisual[]>(board.kinds.map(() => CLOSED_CELL));
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

export default BoardPreview;
