import { useEffect } from "react";
import { View } from "react-native";
import { useSharedValue } from "react-native-reanimated";

import { createBoard } from "@reckon-path/engine";
import type { Idx, LevelInput } from "@reckon-path/engine";

import { computeBoardGeometry } from "../model/board-geometry";
import type { CellVisual } from "../model/cell-visuals";
import { mapPreviewVisualsOf } from "../model/map-preview-visuals";
import { useBoardFx } from "../model/use-board-fx";

import BoardCanvas from "./board-canvas";
import { styles } from "./board-styles";

interface IBoardMapPreview {
  level: LevelInput;
  taps: readonly Idx[];
  size: number;
  testID?: string;
}

// Unlike BoardPreview it shows targets and bombs: an arena map is shown to its owner or after the match (в отличие от BoardPreview показывает цели и бомбы: карту арены видит её владелец или после матча).
const BoardMapPreview = ({ level, taps, size, testID }: IBoardMapPreview) => {
  const { board } = createBoard(level);
  const geometry = computeBoardGeometry(board.rows, board.cols, size);
  const cells = mapPreviewVisualsOf(level, taps);
  const visuals = useSharedValue<CellVisual[]>(cells);
  const fx = useBoardFx();

  useEffect(() => {
    visuals.set(cells);
  }, [visuals, cells]);

  return (
    <View
      testID={testID}
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

export default BoardMapPreview;
