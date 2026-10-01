import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import type { AccessibilityActionEvent } from "react-native";

import type { Idx } from "@reckon-path/engine";

import { useGameSessionStore } from "@entities/level";

import type { BoardGeometry } from "../model/board-geometry";
import { cellOrigin } from "../model/board-geometry";
import { cellAccessibilityLabel } from "../model/describe-cell";

import { styles } from "./board-a11y-overlay-styles";

interface IBoardA11yOverlay {
  geometry: BoardGeometry;
  onCellPress: (idx: Idx) => void;
  onCellLongPress: (idx: Idx) => void;
}

const FLAG_ACTION = "flag";

const BoardA11yOverlay = ({ geometry, onCellPress, onCellLongPress }: IBoardA11yOverlay) => {
  const { t } = useTranslation();
  const game = useGameSessionStore((state) => state.game);
  const flags = useGameSessionStore((state) => state.flags);
  if (game === null) return null;

  const handleAction = (idx: Idx) => (event: AccessibilityActionEvent) => {
    if (event.nativeEvent.actionName === FLAG_ACTION) onCellLongPress(idx);
  };

  return (
    <View style={styles.overlay}>
      {game.board.kinds.map((_, idx) => {
        const { x, y } = cellOrigin(geometry, idx);
        return (
          <Pressable
            key={`${game.board.cols}-${idx}`}
            accessibilityRole="button"
            accessibilityLabel={cellAccessibilityLabel(t, game, idx, flags.includes(idx))}
            accessibilityActions={[
              { name: "activate", label: t("play.cell.open") },
              { name: FLAG_ACTION, label: t("play.cell.flag") },
            ]}
            onAccessibilityAction={handleAction(idx)}
            onPress={() => onCellPress(idx)}
            style={[styles.cell, { left: x, top: y, width: geometry.cell, height: geometry.cell }]}
          />
        );
      })}
    </View>
  );
};

export default BoardA11yOverlay;
