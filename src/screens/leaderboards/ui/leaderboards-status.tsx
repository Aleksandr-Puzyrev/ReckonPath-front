import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { isApiError } from "@shared/api";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import LeaderboardsSkeleton from "./leaderboards-skeleton";
import { styles } from "./leaderboards-styles";

interface ILeaderboardsStatus {
  isPending: boolean;
  isOnline: boolean;
  error: Error | null;
  onRetry: () => void;
}

// Offline a query pauses instead of failing, so the network is checked before loading; the screen's bar already says there is no network (без сети запрос ставится на паузу, а не падает, поэтому сеть проверяется раньше загрузки; о том, что сети нет, уже говорит полоса экрана).
const LeaderboardsStatus = ({ isPending, isOnline, error, onRetry }: ILeaderboardsStatus) => {
  const { t } = useTranslation();

  if (!isOnline) return null;
  if (isPending) return <LeaderboardsSkeleton />;
  return (
    <View style={styles.status}>
      <Text variant="body.m" style={styles.message}>
        {t("errors.generic")}
      </Text>
      <Button testID="leaderboards-retry" label={t("common.retry")} onPress={onRetry} />
      {isApiError(error) ? (
        <Text variant="caption" style={styles.message} testID="leaderboards-error-code">
          {error.message}
        </Text>
      ) : null}
    </View>
  );
};

export default LeaderboardsStatus;
