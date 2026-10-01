import { View } from "react-native";

import type { Idx } from "@reckon-path/engine";

import { Text } from "@shared/ui/text";

import type { BoardGeometry } from "../model/board-geometry";
import { cellOrigin } from "../model/board-geometry";

import { styles } from "./board-tooltip-styles";

interface IBoardTooltip {
  geometry: BoardGeometry;
  idx: Idx;
  text: string;
}

const BoardTooltip = ({ geometry, idx, text }: IBoardTooltip) => {
  const { x, y } = cellOrigin(geometry, idx);

  return (
    <View
      pointerEvents="none"
      style={[styles.anchor, { left: x + geometry.cell / 2, bottom: geometry.height - y }]}
    >
      <View style={styles.bubble} accessibilityLiveRegion="polite">
        <Text variant="caption" style={styles.text}>
          {text}
        </Text>
      </View>
    </View>
  );
};

export default BoardTooltip;
