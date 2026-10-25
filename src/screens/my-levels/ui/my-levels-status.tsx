import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { styles } from "./my-levels-styles";

interface IMyLevelsStatus {
  isPending: boolean;
  isError: boolean;
  isOnline: boolean;
  isEmpty: boolean;
  onRetry: () => void;
}

const MyLevelsStatus = ({ isPending, isError, isOnline, isEmpty, onRetry }: IMyLevelsStatus) => {
  const { t } = useTranslation();

  if (!isEmpty) {
    return isOnline ? null : (
      <Text variant="body.s" style={styles.secondary}>
        {t("common.offline")}
      </Text>
    );
  }
  if (isPending) {
    return <View style={styles.skeleton} testID="my-levels-skeleton" accessibilityElementsHidden />;
  }
  if (isError) {
    return (
      <View style={styles.status}>
        <Text variant="body.m" style={styles.secondary}>
          {isOnline ? t("errors.generic") : t("common.offline")}
        </Text>
        <Button testID="my-levels-retry" label={t("common.retry")} onPress={onRetry} />
      </View>
    );
  }
  return (
    <View style={styles.status}>
      <Text variant="body.m" style={styles.secondary}>
        {t("editor.list.empty")}
      </Text>
    </View>
  );
};

export default MyLevelsStatus;
