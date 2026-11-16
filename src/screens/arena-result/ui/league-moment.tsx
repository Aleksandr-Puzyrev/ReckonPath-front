import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { MatchResultView } from "@entities/match";
import { Button } from "@shared/ui/button";
import { LeagueEmblem } from "@shared/ui/league-emblem";
import { Text } from "@shared/ui/text";
import { leagueToneOf } from "@widgets/arena-hero";

import { styles } from "./arena-result-styles";
import RewardRow from "./reward-row";

interface ILeagueMoment {
  promotion: NonNullable<MatchResultView["promotion"]>;
  onNext: () => void;
}

const LeagueMoment = ({ promotion, onNext }: ILeagueMoment) => {
  const { t } = useTranslation();
  const rewards = [
    { kind: "coin" as const, amount: promotion.coins },
    { kind: "emerald" as const, amount: promotion.gems },
  ].filter(({ amount }) => amount > 0);

  return (
    <View style={styles.overlay} testID="league-moment" accessibilityViewIsModal>
      <LeagueEmblem league={leagueToneOf(promotion.league)} numeral={promotion.division} />
      <Text variant="display.m" accessibilityRole="header" style={styles.centered}>
        {t("result.pvp.promotion", {
          league: promotion.title.toUpperCase(),
          division: promotion.division,
        })}
      </Text>
      <RewardRow rewards={rewards} />
      <Button testID="league-next" label={t("league.next")} onPress={onNext} />
    </View>
  );
};

export default LeagueMoment;
