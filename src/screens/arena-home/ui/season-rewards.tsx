import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import type { RewardItem } from "@entities/arena";
import { formatNumber } from "@shared/lib";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import CheckIcon from "@assets/icons/levels/check.svg";
import CoinIcon from "@assets/icons/play/coin.svg";
import EmeraldIcon from "@assets/icons/play/emerald.svg";

import { styles } from "./season-summary-styles";

interface ISeasonRewards {
  coins: number;
  gems: number;
  item: RewardItem | undefined;
  isClaimed: boolean;
  isDisabled: boolean;
  onClaim: () => void;
}

const SeasonRewards = ({ coins, gems, item, isClaimed, isDisabled, onClaim }: ISeasonRewards) => {
  const { t, i18n } = useTranslation();
  const { theme } = useUnistyles();
  const iconSize = theme.sizes.icon.m;

  return (
    <View style={styles.card}>
      <Text variant="eyebrow" style={styles.eyebrow}>
        {t("season.rewards")}
      </Text>
      <View style={styles.rewards}>
        {coins > 0 ? (
          <View style={styles.reward}>
            <CoinIcon width={iconSize} height={iconSize} />
            <Text variant="title.s">{formatNumber(coins, i18n.language)}</Text>
          </View>
        ) : null}
        {gems > 0 ? (
          <View style={styles.reward}>
            <EmeraldIcon width={iconSize} height={iconSize} />
            <Text variant="title.s">{formatNumber(gems, i18n.language)}</Text>
          </View>
        ) : null}
        {item === undefined ? null : (
          <View style={styles.reward}>
            <Text variant="title.s">{item.title}</Text>
          </View>
        )}
      </View>
      {isClaimed ? (
        <View style={styles.claimed} testID="summary-claimed">
          <CheckIcon width={iconSize} height={iconSize} color={theme.colors.status.success} />
          <Text variant="button.m">{t("arena.track.claimed")}</Text>
        </View>
      ) : (
        <Button
          testID="summary-claim"
          label={t("season.claim").toLocaleUpperCase()}
          variant="primary"
          size="l"
          isDisabled={isDisabled}
          onPress={onClaim}
        />
      )}
    </View>
  );
};

export default SeasonRewards;
