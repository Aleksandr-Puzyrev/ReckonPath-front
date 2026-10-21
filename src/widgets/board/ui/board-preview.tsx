import { useEffect } from "react";
import { View } from "react-native";
import { useSharedValue } from "react-native-reanimated";

import { createBoard } from "@reckon-path/engine";
import type { GameState, LevelInput } from "@reckon-path/engine";

import { computeBoardGeometry } from "../model/board-geometry";
import { buildCellVisuals } from "../model/cell-visuals";
import type { CellVisual } from "../model/cell-visuals";
import { useBoardFx } from "../model/use-board-fx";

import BoardCanvas from "./board-canvas";
import { styles } from "./board-styles";

interface IBoardPreview {
  level: LevelInput;
  size: number;
  game?: GameState | null;
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

const PREVIEW_OPTIONS = { flags: [], lastCell: null, showHidden: false };

// An unfinished attempt shows its opened tiles; otherwise every tile is closed (незаконченная попытка показывает открытые клетки, иначе все клетки закрыты).
const visualsOf = (kinds: readonly unknown[], game: GameState | null) =>
  game === null ? kinds.map(() => CLOSED_CELL) : buildCellVisuals(game, PREVIEW_OPTIONS);

const BoardPreview = ({ level, size, game = null }: IBoardPreview) => {
  const { board } = createBoard(level);
  const geometry = computeBoardGeometry(board.rows, board.cols, size);
  const cells = visualsOf(board.kinds, game);
  const visuals = useSharedValue<CellVisual[]>(cells);
  const fx = useBoardFx();

  useEffect(() => {
    visuals.set(cells);
  }, [visuals, cells]);

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
