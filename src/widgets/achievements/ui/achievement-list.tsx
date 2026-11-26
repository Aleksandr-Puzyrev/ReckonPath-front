import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";

import {
  CompetitionReward,
  competitionKeys,
  useAchievements,
  useClaimAchievement,
} from "@entities/competition";
import { itemKeys } from "@entities/item";
import { walletKeys } from "@entities/wallet";
import { errorMessageKey, useIsOnline } from "@shared/api";
import type { components } from "@shared/api";
import { formatNumber } from "@shared/lib";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { styles } from "./achievement-styles";

const progressKeys: Record<components["schemas"]["AchievementCondition"]["metric"], string> = {
  level_stars: "levelStars",
  arena_wins: "arenaWins",
  trophies: "trophies",
  daily_wins: "dailyWins",
  event_maps_won: "eventMapsWon",
};

const AchievementList = () => {
  const { t, i18n } = useTranslation();
  const query = useAchievements();
  const claim = useClaimAchievement();
  const client = useQueryClient();
  const isOnline = useIsOnline();

  const handleClaim = (id: string) =>
    claim.mutate(id, {
      onSuccess: async () => {
        await Promise.all([
          client.invalidateQueries({ queryKey: competitionKeys.achievements }),
          client.invalidateQueries({ queryKey: walletKeys.all }),
          client.invalidateQueries({ queryKey: itemKeys.inventory() }),
        ]);
      },
    });

  return (
    <View style={styles.list}>
      <Text variant="eyebrow" accessibilityRole="header">
        {t("competition.achievements")}
      </Text>
      {!isOnline && <Text variant="body.s">{t("competition.offline")}</Text>}
      {query.isLoading && <ActivityIndicator accessibilityLabel={t("competition.loading")} />}
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
      {query.data?.length === 0 && <Text variant="body.s">{t("competition.noAchievements")}</Text>}
      {query.data?.map((achievement) => (
        <View key={achievement.id} style={styles.card}>
          <Text variant="title.s">{achievement.title}</Text>
          {achievement.description !== "" && (
            <Text variant="body.s">{achievement.description}</Text>
          )}
          {achievement.conditions.map(({ metric, minimum }, index) => (
            <Text key={index} variant="body.s">
              {t("competition.progress", {
                condition: t(`competition.metrics.${metric}`),
                current: formatNumber(
                  achievement.progress[progressKeys[metric]] ?? 0,
                  i18n.language,
                ),
                minimum: formatNumber(minimum, i18n.language),
              })}
            </Text>
          ))}
          <CompetitionReward reward={achievement.reward} />
          {claim.isError && claim.variables === achievement.id && (
            <Text variant="body.s" accessibilityLiveRegion="polite">
              {t(errorMessageKey(claim.error))}
            </Text>
          )}
          {achievement.claimed ? (
            <Text variant="body.s">{t("competition.claimed")}</Text>
          ) : achievement.eligible ? (
            <Button
              label={t("season.claim")}
              variant="primary"
              isDisabled={!isOnline || claim.isPending}
              onPress={() => handleClaim(achievement.id)}
            />
          ) : (
            <Text variant="body.s">{t("competition.locked")}</Text>
          )}
        </View>
      ))}
    </View>
  );
};

export default AchievementList;
