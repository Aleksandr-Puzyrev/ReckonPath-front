import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import type { SeasonResult } from "@entities/arena";
import { useClaimSeasonSummary } from "@features/claim-season-summary";
import type { ErrorMessageKey } from "@shared/api";
import { useIsOnline } from "@shared/api";
import { Button } from "@shared/ui/button";
import { LeagueEmblem } from "@shared/ui/league-emblem";
import { Text } from "@shared/ui/text";
import { leagueToneOf, stepLabelOf } from "@widgets/arena-hero";

import SeasonRewards from "./season-rewards";
import { styles } from "./season-summary-styles";
import TrophyReset from "./trophy-reset";

interface ISeasonSummary {
  result: SeasonResult;
  nextSeason: number;
  onError: (messageKey: ErrorMessageKey) => void;
}

const SEASON_DIGITS = 2;

const SeasonSummary = ({ result, nextSeason, onError }: ISeasonSummary) => {
  const { t } = useTranslation();
  const isOnline = useIsOnline();
  const claim = useClaimSeasonSummary(onError);
  const seasonOf = (id: number) => String(id).padStart(SEASON_DIGITS, "0");
  const standing = [
    t("season.place", { rank: result.rank }),
    t("season.wins", { count: result.wins }),
  ];

  return (
    <View style={styles.overlay} testID="season-summary" accessibilityViewIsModal>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text variant="display.m" accessibilityRole="header" style={styles.center}>
            {t("season.ended", { n: seasonOf(result.number) })}
          </Text>
          <LeagueEmblem
            league={leagueToneOf(result.league.league)}
            numeral={result.league.division}
          />
          <Text variant="title.m">{t("season.peak", { league: stepLabelOf(result.league) })}</Text>
          <Text variant="body.s" style={styles.secondary}>
            {standing.join(" · ")}
          </Text>
        </View>
        <SeasonRewards
          coins={result.coins}
          gems={result.gems}
          item={result.item}
          isClaimed={claim.isClaimed}
          isDisabled={!isOnline || claim.isPending}
          onClaim={claim.claim}
        />
        <TrophyReset before={result.trophiesBefore} after={result.trophiesAfter} />
        <Button
          testID="summary-next"
          label={t("season.started", { n: seasonOf(nextSeason) }).toLocaleUpperCase()}
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
