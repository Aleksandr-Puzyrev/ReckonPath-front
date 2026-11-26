import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { useEventStandings } from "@entities/competition";
import { formatNumber } from "@shared/lib";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import EventQueryState from "./event-query-state";
import { styles } from "./event-styles";

const EventStandings = ({
  standings,
  isOnline,
}: {
  standings: ReturnType<typeof useEventStandings>;
  isOnline: boolean;
}) => {
  const { t, i18n } = useTranslation();
  const rows = standings.data?.pages.flat() ?? [];
  const format = (value: number) => formatNumber(value, i18n.language);
  return (
    <View style={styles.section}>
      <Text variant="eyebrow" accessibilityRole="header">
        {t("leaderboard.title")}
      </Text>
      <EventQueryState
        isLoading={standings.isLoading}
        error={standings.error}
        isOnline={isOnline}
        onRetry={() => void standings.refetch()}
      />
      {standings.isSuccess && rows.length === 0 && (
        <Text variant="body.s">{t("competition.noStandings")}</Text>
      )}
      {rows.map((row) => (
        <View key={row.rank} style={styles.card}>
          <View style={styles.row}>
            <Text variant="title.m">{format(row.rank)}</Text>
            <View style={styles.player}>
              <Text variant="title.s">{row.nickname}</Text>
              <Text variant="caption">
                {t("competition.standing", { score: format(row.score), moves: format(row.moves) })}
              </Text>
            </View>
          </View>
        </View>
      ))}
      {standings.hasNextPage && (
        <Button
          label={t("competition.more")}
          isDisabled={!isOnline || standings.isFetchingNextPage}
          onPress={() => void standings.fetchNextPage()}
        />
      )}
    </View>
  );
};

export default EventStandings;
