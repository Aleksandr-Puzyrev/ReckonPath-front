import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@shared/ui/button";
import { LeagueEmblem } from "@shared/ui/league-emblem";
import { Text } from "@shared/ui/text";
import { divisionNumeral, divisionStateOf, leagueToneOf } from "@widgets/arena-hero";

import { styles } from "./arena-result-styles";

interface ILeagueMoment {
  trophies: number;
  isUp: boolean;
  onNext: () => void;
}

const LeagueMoment = ({ trophies, isUp, onNext }: ILeagueMoment) => {
  const { t } = useTranslation();
  const { league, division } = divisionStateOf(trophies);

  return (
    <View style={styles.overlay} testID="league-moment" accessibilityViewIsModal>
      <LeagueEmblem league={leagueToneOf(league)} numeral={divisionNumeral(division)} />
      <Text variant="display.m" accessibilityRole="header" style={styles.centered}>
        {isUp ? t("league.up", { league }) : t("league.down", { league })}
      </Text>
      {isUp ? (
        <Text variant="body.m" style={[styles.secondary, styles.centered]}>
          {t("league.floor", { league })}
        </Text>
      ) : null}
      <Button testID="league-next" label={t("league.next")} onPress={onNext} />
    </View>
  );
};

export default LeagueMoment;
