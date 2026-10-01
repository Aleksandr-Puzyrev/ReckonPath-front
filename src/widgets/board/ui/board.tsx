import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AccessibilityInfo, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";

import type { Idx } from "@reckon-path/engine";

import { useGameSessionStore } from "@entities/level";

import { computeBoardGeometry } from "../model/board-geometry";
import { buildCellVisuals } from "../model/cell-visuals";
import type { CellVisual } from "../model/cell-visuals";
import { describeRevealedCell } from "../model/describe-cell";
import type { BoardFx } from "../model/use-board-fx";

import BoardA11yOverlay from "./board-a11y-overlay";
import BoardCanvas from "./board-canvas";
import { styles } from "./board-styles";
import BoardTooltip from "./board-tooltip";

interface IBoard {
  size: number;
  fx: BoardFx;
  showHidden: boolean;
  onCellPress: (idx: Idx) => void;
  onCellLongPress: (idx: Idx) => void;
}

interface Tooltip {
  idx: Idx;
  text: string;
}

const lastTappedCell = () => {
  const taps = useGameSessionStore
    .getState()
    .actions.flatMap((action) => (action.type === "tap" ? [action.cell] : []));
  return taps.at(-1) ?? null;
};

const Board = ({ size, fx, showHidden, onCellPress, onCellLongPress }: IBoard) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const board = useGameSessionStore((state) => state.game?.board);
  const visuals = useSharedValue<CellVisual[]>([]);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [isScreenReader, setIsScreenReader] = useState(false);

  useEffect(() => {
    const update = () => {
      const { game, flags } = useGameSessionStore.getState();
      if (game === null) return;
      visuals.set(buildCellVisuals(game, { flags, lastCell: lastTappedCell(), showHidden }));
    };
    update();
    return useGameSessionStore.subscribe(update);
  }, [visuals, showHidden]);

  useEffect(() => {
    void AccessibilityInfo.isScreenReaderEnabled().then(setIsScreenReader);
    const subscription = AccessibilityInfo.addEventListener(
      "screenReaderChanged",
      setIsScreenReader,
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (tooltip === null) return;
    const timer = setTimeout(() => setTooltip(null), theme.motion.toast.duration);
    return () => clearTimeout(timer);
  }, [tooltip, theme.motion.toast.duration]);

  if (board === undefined) return null;
  const geometry = computeBoardGeometry(board.rows, board.cols, size);

  const handleCellPress = (idx: Idx) => {
    const { game } = useGameSessionStore.getState();
    const text = game === null ? null : describeRevealedCell(t, game, idx);
    setTooltip(text === null ? null : { idx, text });
    onCellPress(idx);
  };

  return (
    <View
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
        onCellPress={handleCellPress}
        onCellLongPress={onCellLongPress}
      />
      {tooltip === null ? null : (
        <BoardTooltip geometry={geometry} idx={tooltip.idx} text={tooltip.text} />
      )}
      {isScreenReader ? (
        <BoardA11yOverlay
          geometry={geometry}
          onCellPress={handleCellPress}
          onCellLongPress={onCellLongPress}
        />
      ) : null}
    </View>
  );
};

export default Board;
