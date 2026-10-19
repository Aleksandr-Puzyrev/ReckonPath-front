import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Text } from "@shared/ui/text";

import CoinIcon from "@assets/icons/play/coin.svg";
import EmeraldIcon from "@assets/icons/play/emerald.svg";

import type { RewardItem } from "../model/rewards-of";

import { styles } from "./arena-result-styles";

interface IRewardRow {
  rewards: readonly RewardItem[];
}

const RewardRow = ({ rewards }: IRewardRow) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const iconSize = theme.sizes.icon.m;

  const labelOf = ({ kind, amount }: RewardItem) => {
    if (kind === "rp") return t("result.pvp.rp", { n: amount });
    if (kind === "xp") return t("result.pvp.xp", { n: amount });
    return t("result.pvp.amount", { n: amount });
  };

  return (
    <View style={styles.rewards} testID="result-rewards">
      {rewards.map((reward) => (
        <View key={reward.kind} style={styles.reward}>
          {reward.kind === "coin" ? <CoinIcon width={iconSize} height={iconSize} /> : null}
          {reward.kind === "emerald" ? <EmeraldIcon width={iconSize} height={iconSize} /> : null}
          <Text variant="title.s">{labelOf(reward)}</Text>
        </View>
      ))}
    </View>
  );
};

export default RewardRow;
