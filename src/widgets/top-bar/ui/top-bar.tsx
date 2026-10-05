import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { useWalletQuery } from "@entities/wallet";
import { formatNumber } from "@shared/lib";
import { Text } from "@shared/ui/text";

import CoinIcon from "@assets/icons/play/coin.svg";
import EmeraldIcon from "@assets/icons/play/emerald.svg";
import emblem from "@assets/images/reckon-emblem.png";

import { styles } from "./top-bar-styles";

interface ITopBar {
  onWalletPress: () => void;
}

const TopBar = ({ onWalletPress }: ITopBar) => {
  const { t, i18n } = useTranslation();
  const { theme } = useUnistyles();
  const { data: wallet } = useWalletQuery();
  const iconSize = theme.sizes.icon.m;

  return (
    <View style={styles.bar}>
      <Image source={emblem} style={styles.emblem} accessibilityLabel={t("brand.emblem")} />
      <View style={styles.brand}>
        <Text variant="title.s" numberOfLines={1}>
          {t("brand.first")}
          <Text variant="title.s" style={styles.accent}>
            {t("brand.second")}
          </Text>
        </Text>
        <Text variant="eyebrow" style={styles.tagline}>
          {t("brand.tagline")}
        </Text>
      </View>
      {wallet === undefined ? null : (
        <>
          <Pressable
            testID="wallet-emeralds"
            accessibilityRole="button"
            accessibilityLabel={t("wallet.emeralds", { count: wallet.emeralds })}
            onPress={onWalletPress}
            style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
          >
            <EmeraldIcon width={iconSize} height={iconSize} />
            <Text variant="caption">{formatNumber(wallet.emeralds, i18n.language)}</Text>
          </Pressable>
          <Pressable
            testID="wallet-coins"
            accessibilityRole="button"
            accessibilityLabel={t("wallet.coins", { count: wallet.coins })}
            onPress={onWalletPress}
            style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
          >
            <CoinIcon width={iconSize} height={iconSize} />
            <Text variant="caption">{formatNumber(wallet.coins, i18n.language)}</Text>
          </Pressable>
        </>
      )}
    </View>
  );
};

export default TopBar;
