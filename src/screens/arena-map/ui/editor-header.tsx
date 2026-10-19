import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Button } from "@shared/ui/button";
import { IconButton } from "@shared/ui/icon-button";
import { Text } from "@shared/ui/text";

import RedoIcon from "@assets/icons/arena/redo.svg";
import UndoIcon from "@assets/icons/arena/undo.svg";
import ChevronLeftIcon from "@assets/icons/levels/chevron-left.svg";

import { styles } from "./arena-map-styles";

interface IEditorHeader {
  name: string;
  canUndo: boolean;
  canRedo: boolean;
  canSave: boolean;
  onBack: () => void;
  onRename: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
}

const EditorHeader = ({
  name,
  canUndo,
  canRedo,
  canSave,
  onBack,
  onRename,
  onUndo,
  onRedo,
  onSave,
}: IEditorHeader) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const iconSize = theme.sizes.iconButton.icon;
  const colorOf = (isEnabled: boolean) =>
    isEnabled ? theme.colors.text.primary : theme.colors.text.disabled;

  return (
    <View style={styles.header}>
      <IconButton
        testID="editor-back"
        accessibilityLabel={t("common.back")}
        onPress={onBack}
        icon={<ChevronLeftIcon width={iconSize} height={iconSize} color={colorOf(true)} />}
      />
      <Pressable
        testID="editor-name"
        accessibilityRole="button"
        accessibilityLabel={`${t("map.rename")}: ${name}`}
        onPress={onRename}
        style={styles.name}
      >
        <Text variant="title.m" numberOfLines={1}>
          {name}
        </Text>
      </Pressable>
      <IconButton
        testID="editor-undo"
        accessibilityLabel={t("map.undo")}
        onPress={onUndo}
        icon={<UndoIcon width={iconSize} height={iconSize} color={colorOf(canUndo)} />}
      />
      <IconButton
        testID="editor-redo"
        accessibilityLabel={t("map.redo")}
        onPress={onRedo}
        icon={<RedoIcon width={iconSize} height={iconSize} color={colorOf(canRedo)} />}
      />
      <Button
        testID="editor-save"
        label={t("map.save")}
        size="s"
        variant="secondary"
        isDisabled={!canSave}
        onPress={onSave}
      />
    </View>
  );
};

export default EditorHeader;
