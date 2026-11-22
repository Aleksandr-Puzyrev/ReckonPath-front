import { useTranslation } from "react-i18next";

import type { MatchResultView } from "@entities/match";
import { Text } from "@shared/ui/text";
import { LeagueProgress } from "@widgets/arena-hero";
import { formatTrophyDelta } from "@widgets/match-history";

import { rewardsOf } from "../model/rewards-of";

import { styles } from "./arena-result-styles";
import RewardRow from "./reward-row";

interface IResultStanding {
  result: MatchResultView;
}

const ResultStanding = ({ result }: IResultStanding) => {
  const { t } = useTranslation();

  return (
    <>
      <Text variant="display.m" style={styles.centered} testID="result-trophies">
        {t("result.pvp.trophies", {
          count: Math.abs(result.trophies),
          delta: formatTrophyDelta(result.trophies),
        })}
      </Text>
      <LeagueProgress
        trophies={result.trophyNow}
        fromTrophies={result.trophyNow - result.trophies}
        league={result.league}
        next={result.next}
        isOnHero={false}
      />
      <RewardRow rewards={rewardsOf(result)} />
    </>
  );
};

export default ResultStanding;
