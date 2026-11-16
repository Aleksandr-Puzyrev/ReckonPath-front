import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AccessibilityInfo, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";

import type { Idx } from "@reckon-path/engine";

import type { PlayView } from "@entities/level";

import { computeBoardGeometry } from "../model/board-geometry";
import { buildCellVisuals } from "../model/cell-visuals";
import type { CellVisual } from "../model/cell-visuals";
import { describeRevealedCell } from "../model/describe-cell";
import type { BoardFx } from "../model/use-board-fx";
import { useCoordinatesSize } from "../model/use-coordinates-size";

import BoardA11yOverlay from "./board-a11y-overlay";
import BoardCanvas from "./board-canvas";
import BoardCoordinates from "./board-coordinates";
import { styles } from "./board-styles";
import BoardTooltip from "./board-tooltip";

interface IBoard {
  view: PlayView;
  flags: readonly Idx[];
  size: number;
  fx: BoardFx;
  showHidden: boolean;
  highlight?: readonly Idx[] | null;
  onCellPress: (idx: Idx) => void;
  onCellLongPress: (idx: Idx) => void;
}

interface Tooltip {
  idx: Idx;
  text: string;
}

const Board = ({
  view,
  flags,
  size,
  fx,
  showHidden,
  highlight = null,
  onCellPress,
  onCellLongPress,
}: IBoard) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { isCoordinatesOn, boardSize } = useCoordinatesSize(size);
  const cells = buildCellVisuals(view, { flags, lastCell: view.lastCell, showHidden, highlight });
  const visuals = useSharedValue<CellVisual[]>(cells);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [isScreenReader, setIsScreenReader] = useState(false);

  useEffect(() => {
    visuals.set(cells);
  }, [visuals, cells]);

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

  const { board } = view;
  const geometry = computeBoardGeometry(board.rows, board.cols, boardSize);

  const handleCellPress = (idx: Idx) => {
    const text = describeRevealedCell(t, view, idx);
    setTooltip(text === null ? null : { idx, text });
    onCellPress(idx);
  };

  const content = (
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
          view={view}
          flags={flags}
          geometry={geometry}
          onCellPress={handleCellPress}
          onCellLongPress={onCellLongPress}
        />
      ) : null}
    </View>
  );

  return isCoordinatesOn ? (
    <BoardCoordinates geometry={geometry}>{content}</BoardCoordinates>
  ) : (
    content
  );
};

export default Board;
