import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { EditorCounts, EditorElement } from "@reckon-path/engine";

import { ToolTile } from "@widgets/editor-kit";

import { LEVEL_TOOLS } from "../model/editor-tool";
import type { LevelEditorTool } from "../model/editor-tool";

import { styles } from "./level-editor-styles";

interface ILevelTools {
  tool: LevelEditorTool;
  counts: EditorCounts;
  limits: EditorCounts;
  flash: { tool: LevelEditorTool | null; key: number };
  onSelect: (tool: LevelEditorTool) => void;
}

const ELEMENT_OF: Record<LevelEditorTool, EditorElement | null> = {
  target: "targets",
  fence: "fences",
  stream: "streams",
  heavy: "heavy",
  rock: "rocks",
  bridge: "bridges",
  bomb: "bombs",
  beacon: "beacons",
  buoy: "buoys",
  erase: null,
};

const LevelTools = ({ tool, counts, limits, flash, onSelect }: ILevelTools) => {
  const { t } = useTranslation();

  return (
    <View style={styles.palette}>
      {LEVEL_TOOLS.map((item) => {
        const element = ELEMENT_OF[item];
        return (
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
        );
      })}
    </View>
  );
};

export default LevelTools;
