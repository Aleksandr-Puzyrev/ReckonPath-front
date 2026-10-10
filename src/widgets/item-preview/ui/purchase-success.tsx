import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";

import { OfferPreview, currencyOf } from "@entities/item";
import type { OfferView } from "@entities/item";
import { useWalletQuery } from "@entities/wallet";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import PriceText from "./price-text";
import { styles } from "./purchase-success-styles";

interface IPurchaseSuccess {
  view: OfferView;
  canEquip: boolean;
  onLater: () => void;
  onEquip: () => void;
}

const PurchaseSuccess = ({ view, canEquip, onLater, onEquip }: IPurchaseSuccess) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { data: wallet } = useWalletQuery();
  const currency = currencyOf(view.price);
  const balance = wallet?.[currency] ?? 0;

  return (
    <View style={styles.success}>
      <Animated.View entering={ZoomIn.duration(theme.motion.duration.base)} style={styles.preview}>
        <OfferPreview preview={view.preview} rarity={view.rarity} slot={view.slot} />
      </Animated.View>
      <Text variant="eyebrow" style={styles.title} accessibilityLiveRegion="polite">
        {t("shop.success.title")}
      </Text>
      <Text variant="title.l" style={styles.centered}>
        {view.name}
      </Text>
      <PriceText
        i18nKey="shop.success.balance"
        price={currency === "emeralds" ? { emeralds: balance } : { coins: balance }}
        variant="body.m"
        style={styles.balance}
      />
      <View style={styles.actions}>
        <View style={styles.later}>
          <Button label={t("common.later")} onPress={onLater} size="l" />
        </View>
        {canEquip ? (
          <View style={styles.equip}>
            <Button
              testID="success-equip"
              label={t("shop.equip")}
              onPress={onEquip}
              variant="primary"
              size="l"
            />
          </View>
        ) : null}
      </View>
    </View>
  );
};

export default PurchaseSuccess;
