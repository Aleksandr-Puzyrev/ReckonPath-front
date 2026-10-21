import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import type { Wallet } from "@entities/wallet";
import { formatNumber } from "@shared/lib";
import { Text } from "@shared/ui/text";

import CoinIcon from "@assets/icons/play/coin.svg";
import EmeraldIcon from "@assets/icons/play/emerald.svg";

import { styles } from "./settings-styles";

interface ICurrencyAmounts {
  wallet: Wallet;
}

const CurrencyAmounts = ({ wallet }: ICurrencyAmounts) => {
  const { i18n } = useTranslation();
  const { theme } = useUnistyles();
  const iconSize = theme.sizes.icon.s;

  return (
    <View style={styles.valueRow}>
      <EmeraldIcon width={iconSize} height={iconSize} />
      <Text variant="body.m" style={styles.value}>
        {formatNumber(wallet.emeralds, i18n.language)}
      </Text>
      <CoinIcon width={iconSize} height={iconSize} />
      <Text variant="body.m" style={styles.value}>
        {formatNumber(wallet.coins, i18n.language)}
      </Text>
    </View>
  );
};

export default CurrencyAmounts;
