import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { MatchView } from "@entities/match";
import { Text } from "@shared/ui/text";

import VersusHalf from "./versus-half";
import { styles } from "./versus-styles";

interface IVersusView {
  view: MatchView;
}

const VersusView = ({ view }: IVersusView) => {
  const { t } = useTranslation();
  const { first, rival, me } = view;
  const coinText = () => {
    if (first === undefined) return t("vs.coin");
    return first === "me" ? t("vs.firstMe") : t("vs.first", { name: rival.name });
  };

  return (
    <View style={styles.versus} testID="versus">
      <VersusHalf side="opponent" player={rival} />
      <Text variant="display.xl" style={styles.vs}>
        {t("vs.title")}
      </Text>
      <VersusHalf side="me" player={me} />
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
