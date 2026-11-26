import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { useMarkNotificationRead, useNotificationHistory } from "@entities/notification";
import { errorMessageKey, useIsOnline } from "@shared/api";
import { formatDateTime } from "@shared/lib";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import HistoryScreen from "./history-screen";
import { styles } from "./settings-styles";

const NotificationHistoryScreen = () => {
  const { t, i18n } = useTranslation();
  const query = useNotificationHistory();
  const markRead = useMarkNotificationRead();
  const isOnline = useIsOnline();
  const notifications = query.data?.pages.flatMap((page) => page.items);
  return (
    <HistoryScreen
      title={t("history.notifications")}
      empty={t("history.noNotifications")}
      isEmpty={notifications?.length === 0}
      isLoading={query.isLoading}
      error={query.error}
      onRetry={() => void query.refetch()}
    >
      {notifications?.map((entry) => (
        <View key={entry.id} style={[styles.card, styles.historyCard]}>
          <Text variant="title.s">{entry.title}</Text>
          <Text variant="body.m">{entry.body}</Text>
          <Text variant="caption" style={styles.value}>
            {formatDateTime(entry.createdAt, i18n.language)}
          </Text>
          {entry.readAt === null && (
            <Button
              label={t("history.markRead")}
              accessibilityLabel={t("history.markTitleRead", { title: entry.title })}
              isDisabled={!isOnline || markRead.isPending}
              onPress={() => markRead.mutate(entry.id)}
            />
          )}
          {markRead.isError && markRead.variables === entry.id && (
            <Text variant="body.s" accessibilityLiveRegion="polite">
              {t(errorMessageKey(markRead.error))}
            </Text>
          )}
        </View>
      ))}
      {query.hasNextPage && (
        <Button
          label={t("competition.more")}
          isDisabled={!isOnline || query.isFetchingNextPage}
          onPress={() => void query.fetchNextPage()}
        />
      )}
    </HistoryScreen>
  );
};

export default NotificationHistoryScreen;
