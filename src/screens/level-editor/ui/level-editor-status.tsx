import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@shared/ui/button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";

import { styles } from "./level-editor-styles";

interface ILevelEditorStatus {
  isPending: boolean;
  isFailed: boolean;
  onRetry: () => void;
  onLeave: () => void;
}

const LevelEditorStatus = ({ isPending, isFailed, onRetry, onLeave }: ILevelEditorStatus) => {
  const { t } = useTranslation();

  return (
    <Screen style={styles.screen}>
      {isPending && !isFailed ? null : (
        <View style={styles.failed}>
          <Text variant="body.m" style={styles.secondary}>
            {t("errors.generic")}
          </Text>
          <Button testID="level-editor-retry" label={t("common.retry")} onPress={onRetry} />
          <Button label={t("common.back")} variant="secondary" onPress={onLeave} />
        </View>
      )}
    </Screen>
  );
};

export default LevelEditorStatus;
