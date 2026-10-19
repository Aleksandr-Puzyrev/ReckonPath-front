import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@shared/ui/button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";

import { styles } from "./arena-map-styles";

interface IEditorStatus {
  isPending: boolean;
  isFailed: boolean;
  onRetry: () => void;
  onLeave: () => void;
}

const EditorStatus = ({ isPending, isFailed, onRetry, onLeave }: IEditorStatus) => {
  const { t } = useTranslation();

  if (isPending && !isFailed) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.skeleton} testID="editor-skeleton" accessibilityElementsHidden />
      </Screen>
    );
  }
  return (
    <Screen style={styles.screen}>
      <View style={styles.failed}>
        <Text variant="body.m" style={styles.secondary}>
          {t("errors.generic")}
        </Text>
        <Button testID="editor-retry" label={t("common.retry")} onPress={onRetry} />
        <Button label={t("common.back")} variant="secondary" onPress={onLeave} />
      </View>
    </Screen>
  );
};

export default EditorStatus;
