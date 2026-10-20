import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import type { SeasonSummary as Summary } from "@entities/arena";
import { useClaimSeasonSummary } from "@features/claim-season-summary";
import type { ErrorMessageKey } from "@shared/api";
import { useIsOnline } from "@shared/api";
import { Button } from "@shared/ui/button";
import { LeagueEmblem } from "@shared/ui/league-emblem";
import { Text } from "@shared/ui/text";
import { divisionNumeral, leagueLabelOf, leagueToneOf } from "@widgets/arena-hero";

import SeasonRewards from "./season-rewards";
import { styles } from "./season-summary-styles";
import TrophyReset from "./trophy-reset";

interface ISeasonSummary {
  summary: Summary;
  nextSeasonId: number;
  onError: (messageKey: ErrorMessageKey) => void;
}

const SEASON_DIGITS = 2;

const SeasonSummary = ({ summary, nextSeasonId, onError }: ISeasonSummary) => {
  const { t } = useTranslation();
  const isOnline = useIsOnline();
  const claim = useClaimSeasonSummary(onError);
  const seasonOf = (id: number) => String(id).padStart(SEASON_DIGITS, "0");
  const standing = [
    summary.rank === null ? null : t("season.place", { rank: summary.rank }),
    t("season.wins", { count: summary.wins }),
  ].filter((part) => part !== null);

  return (
    <View style={styles.overlay} testID="season-summary" accessibilityViewIsModal>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text variant="display.m" accessibilityRole="header" style={styles.center}>
            {t("season.ended", { n: seasonOf(summary.seasonId) })}
          </Text>
          <LeagueEmblem
            league={leagueToneOf(summary.peakLeague)}
            numeral={divisionNumeral(summary.peakDivision)}
          />
          <Text variant="title.m">
            {t("season.peak", { league: leagueLabelOf(summary.peakLeague, summary.peakDivision) })}
          </Text>
          <Text variant="body.s" style={styles.secondary}>
            {standing.join(" · ")}
          </Text>
        </View>
        <SeasonRewards
          rewards={summary.rewards}
          isClaimed={summary.claimed || claim.isClaimed}
          isDisabled={!isOnline || claim.isPending}
          onClaim={claim.claim}
        />
        <TrophyReset before={summary.trophiesBefore} after={summary.trophiesAfter} />
        <Button
          testID="summary-next"
          label={t("season.started", { n: seasonOf(nextSeasonId) }).toLocaleUpperCase()}
          variant="primary"
          size="l"
          isDisabled={!isOnline || claim.isPending}
          onPress={claim.finish}
        />
      </ScrollView>
    </View>
  );
};

export default SeasonSummary;
