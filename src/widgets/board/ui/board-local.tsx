import { useEffect } from "react";
import { View } from "react-native";
import { useSharedValue } from "react-native-reanimated";

import type { GameState, Idx } from "@reckon-path/engine";

import { computeBoardGeometry } from "../model/board-geometry";
import { buildCellVisuals } from "../model/cell-visuals";
import type { CellVisual } from "../model/cell-visuals";
import type { BoardFx } from "../model/use-board-fx";

import BoardCanvas from "./board-canvas";
import { styles } from "./board-styles";

interface IBoardLocal {
  game: GameState;
  size: number;
  fx: BoardFx;
  lastCell: Idx | null;
  isHiddenShown: boolean;
  onCellPress: (idx: Idx) => void;
}

// A board of a game kept by its screen; the author's tryout shows the hidden targets half-transparent (поле партии, которую ведёт её экран; в пробной игре автора скрытые цели видны полупрозрачными).
const BoardLocal = ({ game, size, fx, lastCell, isHiddenShown, onCellPress }: IBoardLocal) => {
  const geometry = computeBoardGeometry(game.board.rows, game.board.cols, size);
  const cells = buildCellVisuals(game, { flags: [], lastCell, showHidden: isHiddenShown });
  const visuals = useSharedValue<CellVisual[]>(cells);

  useEffect(() => {
    visuals.set(cells);
  }, [visuals, cells]);

  return (
    <View
      testID="board-local"
      style={[
        styles.board,
        { width: geometry.width, height: geometry.height, borderRadius: geometry.frameRadius },
      ]}
    >
      <BoardCanvas
        board={game.board}
        geometry={geometry}
        visuals={visuals}
        fx={fx}
        onCellPress={onCellPress}
      />
    </View>
  );
};

export default BoardLocal;
