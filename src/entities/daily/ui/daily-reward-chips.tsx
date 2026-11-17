import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Text } from "@shared/ui/text";

import CoinIcon from "@assets/icons/play/coin.svg";
import EmeraldIcon from "@assets/icons/play/emerald.svg";

import { styles } from "./daily-reward-chips-styles";

interface IDailyRewardChips {
  coins: number;
  gems: number;
  xp: number;
}

const DailyRewardChips = ({ coins, gems, xp }: IDailyRewardChips) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const iconSize = theme.sizes.icon.m;
  if (coins === 0 && gems === 0 && xp === 0) return null;

  return (
    <View style={styles.rewards} testID="daily-rewards">
      {coins > 0 ? (
        <View style={styles.reward}>
          <CoinIcon width={iconSize} height={iconSize} />
          <Text variant="title.s">{t("result.pvp.amount", { n: coins })}</Text>
        </View>
      ) : null}
      {gems > 0 ? (
        <View style={styles.reward}>
          <EmeraldIcon width={iconSize} height={iconSize} />
          <Text variant="title.s">{t("result.pvp.amount", { n: gems })}</Text>
        </View>
      ) : null}
      {xp > 0 ? (
        <View style={styles.reward}>
          <Text variant="title.s">{t("result.pvp.xp", { n: xp })}</Text>
        </View>
      ) : null}
    </View>
  );
};

export default DailyRewardChips;
