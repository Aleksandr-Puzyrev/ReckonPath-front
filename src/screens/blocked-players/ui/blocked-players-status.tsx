import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { isApiError } from "@shared/api";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { styles } from "./blocked-players-styles";

interface IBlockedPlayersStatus {
  isPending: boolean;
  isOnline: boolean;
  error: Error | null;
  onRetry: () => void;
}

const SKELETON_ROWS = [0, 1, 2];

// Offline a query pauses instead of failing, so the network is checked before loading; the screen's bar already says there is no network (без сети запрос ставится на паузу, а не падает, поэтому сеть проверяется раньше загрузки; о том, что сети нет, уже говорит полоса экрана).
const BlockedPlayersStatus = ({ isPending, isOnline, error, onRetry }: IBlockedPlayersStatus) => {
  const { t } = useTranslation();

  if (!isOnline) return null;
  if (isPending) {
    return (
      <View
        testID="blocked-skeleton"
        style={styles.content}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {SKELETON_ROWS.map((row) => (
          <View key={row} style={styles.skeletonRow} />
        ))}
      </View>
    );
  }
  return (
    <View style={styles.status}>
      <Text variant="body.m" style={styles.message}>
        {t("errors.generic")}
      </Text>
      <Button testID="blocked-retry" label={t("common.retry")} onPress={onRetry} />
      {isApiError(error) ? (
        <Text variant="caption" style={styles.message} testID="blocked-error-code">
          {error.message}
        </Text>
      ) : null}
    </View>
  );
};

export default BlockedPlayersStatus;
