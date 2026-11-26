import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";

import { useCampaignStats } from "@entities/level";
import { errorMessageKey, useIsOnline } from "@shared/api";
import { formatNumber } from "@shared/lib";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { styles } from "./profile-screen-styles";

const CampaignStats = () => {
  const { t, i18n } = useTranslation();
  const query = useCampaignStats();
  const isOnline = useIsOnline();
  const stats = query.data;
  const format = (value: number) => formatNumber(value, i18n.language);
  const counters =
    stats === undefined
      ? []
      : ([
          ["profile.campaignStats.levels", format(stats.levelsDone), format(stats.levelsTotal)],
          ["profile.campaignStats.stars", format(stats.stars), format(stats.starsMax)],
          ["profile.campaignStats.perfect", format(stats.perfect)],
          ["profile.campaignStats.coins", format(stats.coinsEarned)],
        ] as const);

  return (
    <View style={styles.stats}>
      <Text variant="eyebrow" style={styles.section} accessibilityRole="header">
        {t("profile.campaignStats.title")}
      </Text>
      {query.isLoading && <ActivityIndicator accessibilityLabel={t("competition.loading")} />}
      {!isOnline && stats === undefined && <Text variant="body.s">{t("competition.offline")}</Text>}
      {query.isError && (
        <>
          <Text variant="body.s">{t(errorMessageKey(query.error))}</Text>
          <Button
            label={t("common.retry")}
            isDisabled={!isOnline}
            onPress={() => void query.refetch()}
          />
        </>
      )}
      <View style={styles.statsGrid}>
        {counters.map(([key, value, total]) => (
          <View key={key} style={styles.stat}>
            <Text variant="title.m">{total === undefined ? value : `${value} / ${total}`}</Text>
            <Text variant="body.s">{t(key)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default CampaignStats;
