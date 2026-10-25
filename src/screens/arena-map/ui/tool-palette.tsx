import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { ElementCounts, LimitedElement } from "@entities/arena-map";
import { ToolTile } from "@widgets/editor-kit";

import type { EditorTool } from "../model/use-map-editor";

import { styles } from "./arena-map-styles";

interface IToolPalette {
  tool: EditorTool;
  counts: ElementCounts;
  limits: ElementCounts;
  flash: { tool: EditorTool | null; key: number };
  isRandomDisabled: boolean;
  onSelect: (tool: EditorTool) => void;
  onRandom: () => void;
}

const TOOLS: readonly [EditorTool, LimitedElement | null][] = [
  ["target", "targets"],
  ["fence", "fences"],
  ["stream", "streams"],
  ["heavy", "heavy"],
  ["rock", "rocks"],
  ["bridge", "bridges"],
  ["bomb", "bombs"],
  ["erase", null],
];

const ToolPalette = ({
  tool,
  counts,
  limits,
  flash,
  isRandomDisabled,
  onSelect,
  onRandom,
}: IToolPalette) => {
  const { t } = useTranslation();

  return (
    <View style={styles.palette}>
      {TOOLS.map(([item, element]) => (
        <View key={item} style={styles.tileCell}>
          <ToolTile
            tool={item}
            label={t(`map.tools.${item}`)}
            count={element === null ? null : counts[element]}
            max={element === null ? null : limits[element]}
            isSelected={tool === item}
            isDisabled={false}
            flashKey={flash.tool === item ? flash.key : 0}
            onPress={() => onSelect(item)}
          />
        </View>
      ))}
      <View style={styles.tileCell}>
        <ToolTile
          tool="random"
          label={t("map.tools.random")}
          count={null}
          max={null}
          isSelected={false}
          isDisabled={isRandomDisabled}
          flashKey={0}
          onPress={onRandom}
        />
      </View>
    </View>
  );
};

export default ToolPalette;
