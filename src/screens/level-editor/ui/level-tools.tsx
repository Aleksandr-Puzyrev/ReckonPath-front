import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { ToolTile } from "@widgets/editor-kit";

import { LEVEL_TOOLS } from "../model/editor-tool";
import type { LevelEditorTool } from "../model/editor-tool";

import { styles } from "./level-editor-styles";

interface ILevelTools {
  tool: LevelEditorTool;
  onSelect: (tool: LevelEditorTool) => void;
}

const LevelTools = ({ tool, onSelect }: ILevelTools) => {
  const { t } = useTranslation();

  return (
    <View style={styles.palette}>
      {LEVEL_TOOLS.map((item) => (
        <View key={item} style={styles.tileCell}>
          <ToolTile
            tool={item}
            label={t(`map.tools.${item}`)}
            count={null}
            max={null}
            isSelected={tool === item}
            isDisabled={false}
            flashKey={0}
            onPress={() => onSelect(item)}
          />
        </View>
      ))}
    </View>
  );
};

export default LevelTools;
