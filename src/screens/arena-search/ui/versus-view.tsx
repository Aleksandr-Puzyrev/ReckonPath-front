import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { Arena } from "@entities/arena";
import type { MatchOpponent, Side } from "@entities/match";
import { useMeQuery } from "@entities/wallet";
import { Text } from "@shared/ui/text";

import { styles } from "./arena-search-styles";
import VersusHalf from "./versus-half";

interface IVersusView {
  opponent: MatchOpponent;
  profile: Arena["profile"] | undefined;
  firstPlayer: Side | null;
}

const VersusView = ({ opponent, profile, firstPlayer }: IVersusView) => {
  const { t } = useTranslation();
  const { data: me } = useMeQuery();
  const coinText = () => {
    if (firstPlayer === null) return t("vs.coin");
    return firstPlayer === "me" ? t("vs.firstMe") : t("vs.first", { name: opponent.nickname });
  };

  return (
    <View style={styles.versus} testID="versus">
      <VersusHalf
        side="opponent"
        nickname={opponent.nickname}
        league={opponent.league}
        division={opponent.division ?? 1}
        trophies={opponent.trophies}
        isBot={opponent.isBot}
      />
      <Text variant="display.xl" style={styles.vs}>
        {t("vs.title")}
      </Text>
      <VersusHalf
        side="me"
        nickname={me?.nickname ?? ""}
        league={profile?.league ?? ""}
        division={profile?.division ?? 1}
        trophies={profile?.trophies ?? 0}
        isBot={false}
      />
      <Text
        variant="title.m"
        style={styles.coin}
        accessibilityLiveRegion="polite"
        testID="versus-coin"
      >
        {coinText()}
      </Text>
    </View>
  );
};

export default VersusView;
