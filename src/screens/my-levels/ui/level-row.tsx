import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { customLevelTitleOf } from "@entities/custom-level";
import type { SavedCustomLevel } from "@entities/custom-level";
import { formatDayMonth } from "@shared/lib";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";
import { BoardPreview } from "@widgets/board";

import { styles } from "./my-levels-styles";

interface ILevelRow {
  entry: SavedCustomLevel;
  isDeleteDisabled: boolean;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

const LevelRow = ({ entry, isDeleteDisabled, onOpen, onDelete }: ILevelRow) => {
  const { t, i18n } = useTranslation();
  const { theme } = useUnistyles();
  const { level } = entry;
  const title = customLevelTitleOf(level, i18n.language);
  const details = [
    t("editor.list.size", { rows: level.rows, cols: level.cols }),
    formatDayMonth(entry.updatedAt, i18n.language),
  ].join(" · ");

  return (
    <Pressable
      testID={`level-row-${entry.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${details}`}
      onPress={() => onOpen(entry.id)}
      style={({ pressed }) => [styles.row, pressed ? styles.pressed : null]}
    >
      <BoardPreview level={level} size={theme.sizes.arena.switchMap} />
      <View style={styles.rowTexts}>
        <Text variant="title.s" numberOfLines={1}>
          {title}
        </Text>
        <Text variant="caption" style={styles.secondary}>
          {details}
        </Text>
      </View>
      <Button
        testID={`level-delete-${entry.id}`}
        label={t("editor.list.delete")}
        variant="ghost"
        size="s"
        isDisabled={isDeleteDisabled}
        onPress={() => onDelete(entry.id)}
      />
    </Pressable>
  );
};

export default LevelRow;
