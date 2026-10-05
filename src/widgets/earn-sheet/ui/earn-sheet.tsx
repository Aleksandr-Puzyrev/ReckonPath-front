import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { useWalletQuery } from "@entities/wallet";
import { formatNumber } from "@shared/lib";
import { Button } from "@shared/ui/button";
import { Sheet } from "@shared/ui/sheet";
import { Text } from "@shared/ui/text";

import CoinIcon from "@assets/icons/play/coin.svg";
import EmeraldIcon from "@assets/icons/play/emerald.svg";

import { styles } from "./earn-sheet-styles";

interface IEarnSheet {
  isOpen: boolean;
  shortBy: number | null;
  onDaily: () => void;
  onClose: () => void;
}

const EarnSheet = ({ isOpen, shortBy, onDaily, onClose }: IEarnSheet) => {
  const { t, i18n } = useTranslation();
  const { theme } = useUnistyles();
  const { data: wallet } = useWalletQuery();
  const iconSize = theme.sizes.icon.l;

  return (
    <Sheet isOpen={isOpen} onDismiss={onClose}>
      {shortBy === null ? (
        <Text variant="display.m">{t("earn.title")}</Text>
      ) : (
        <View style={styles.title}>
          <Text variant="display.m">{t("earn.short")}</Text>
          <EmeraldIcon width={iconSize} height={iconSize} />
          <Text variant="display.m">{shortBy}</Text>
        </View>
      )}
      {wallet === undefined ? null : (
        <View style={styles.balances}>
          <View
            style={styles.balance}
            accessible
            accessibilityLabel={t("wallet.emeralds", { count: wallet.emeralds })}
          >
            <EmeraldIcon width={iconSize} height={iconSize} />
            <Text variant="title.m">{formatNumber(wallet.emeralds, i18n.language)}</Text>
          </View>
          <View
            style={styles.balance}
            accessible
            accessibilityLabel={t("wallet.coins", { count: wallet.coins })}
          >
            <CoinIcon width={iconSize} height={iconSize} />
            <Text variant="title.m">{formatNumber(wallet.coins, i18n.language)}</Text>
          </View>
        </View>
      )}
      <Text variant="body.s" style={styles.secondary}>
        {t("earn.where")}
      </Text>
      <Button testID="earn-daily" label={t("earn.daily")} onPress={onDaily} />
      <Button label={t("common.close")} onPress={onClose} variant="ghost" />
    </Sheet>
  );
};

export default EarnSheet;
