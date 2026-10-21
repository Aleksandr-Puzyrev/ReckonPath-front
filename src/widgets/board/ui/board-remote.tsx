import { useEffect } from "react";
import { View } from "react-native";
import { useSharedValue } from "react-native-reanimated";

import { createBoard } from "@reckon-path/engine";
import type { Idx, LevelInput } from "@reckon-path/engine";

import { computeBoardGeometry } from "../model/board-geometry";
import type { CellVisual } from "../model/cell-visuals";
import { remoteVisualsOf } from "../model/remote-visuals";
import type { RemoteTap } from "../model/remote-visuals";
import type { BoardFx } from "../model/use-board-fx";
import { useCoordinatesSize } from "../model/use-coordinates-size";

import BoardCanvas from "./board-canvas";
import BoardCoordinates from "./board-coordinates";
import { styles } from "./board-styles";

interface IBoardRemote {
  layout: LevelInput;
  size: number;
  fx: BoardFx;
  taps: readonly RemoteTap[];
  flags: readonly Idx[];
  pendingCell: Idx | null;
  isDimmed: boolean;
  onCellPress: (idx: Idx) => void;
  onCellLongPress: (idx: Idx) => void;
}

const BoardRemote = ({
  layout,
  size,
  fx,
  taps,
  flags,
  pendingCell,
  isDimmed,
  onCellPress,
  onCellLongPress,
}: IBoardRemote) => {
  const { isCoordinatesOn, boardSize } = useCoordinatesSize(size);
  const { board, rules } = createBoard(layout);
  const geometry = computeBoardGeometry(board.rows, board.cols, boardSize);
  const cells = remoteVisualsOf(board, rules, taps, { flags, pendingCell, isDimmed });
  const visuals = useSharedValue<CellVisual[]>(cells);

  useEffect(() => {
    visuals.set(cells);
  }, [visuals, cells]);

  const content = (
    <View
      testID="board-remote"
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
        onCellPress={onCellPress}
        onCellLongPress={onCellLongPress}
      />
    </View>
  );

  return isCoordinatesOn ? (
    <BoardCoordinates geometry={geometry}>{content}</BoardCoordinates>
  ) : (
    content
  );
};

export default BoardRemote;
