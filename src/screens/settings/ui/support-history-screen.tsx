import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { useSupportHistory } from "@entities/support";
import { formatDateTime } from "@shared/lib";
import { Text } from "@shared/ui/text";

import HistoryScreen from "./history-screen";
import { styles } from "./settings-styles";

const SupportHistoryScreen = () => {
  const { t, i18n } = useTranslation();
  const query = useSupportHistory();
  return (
    <HistoryScreen
      title={t("history.tickets")}
      empty={t("history.noTickets")}
      isEmpty={query.data?.length === 0}
      isLoading={query.isLoading}
      error={query.error}
      onRetry={() => void query.refetch()}
    >
      {query.data?.map((ticket) => (
        <View key={ticket.id} style={[styles.card, styles.historyCard]}>
          <Text variant="title.s">{t(`history.topic.${ticket.topic}`)}</Text>
          <Text variant="caption" style={styles.value}>
            {t(`history.status.${ticket.status}`)} ·{" "}
            {formatDateTime(ticket.createdAt, i18n.language)}
          </Text>
          <Text variant="body.m" selectable>
            {ticket.message}
          </Text>
          {!!ticket.answer && (
            <>
              <Text variant="eyebrow">{t("history.answer")}</Text>
              <Text variant="body.m" selectable>
                {ticket.answer}
              </Text>
              {ticket.answeredAt && (
                <Text variant="caption" style={styles.value}>
                  {formatDateTime(ticket.answeredAt, i18n.language)}
                </Text>
              )}
            </>
          )}
        </View>
      ))}
    </HistoryScreen>
  );
};

export default SupportHistoryScreen;
