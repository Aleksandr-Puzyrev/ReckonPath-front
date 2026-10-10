import { useTranslation } from "react-i18next";
import { useUnistyles } from "react-native-unistyles";

import { amountOf, currencyOf } from "@entities/item";
import type { OfferView } from "@entities/item";
import { formatNumber } from "@shared/lib";
import { Button } from "@shared/ui/button";

import CheckIcon from "@assets/icons/levels/check.svg";
import CoinIcon from "@assets/icons/play/coin.svg";
import EmeraldIcon from "@assets/icons/play/emerald.svg";

interface IPreviewMainAction {
  view: OfferView;
  isOnline: boolean;
  isPending: boolean;
  isShort: boolean;
  onBuy: () => void;
  onEquip: () => void;
}

const ignorePress = () => undefined;

const PreviewMainAction = ({
  view,
  isOnline,
  isPending,
  isShort,
  onBuy,
  onEquip,
}: IPreviewMainAction) => {
  const { t, i18n } = useTranslation();
  const { theme } = useUnistyles();
  const iconSize = theme.sizes.icon.m;
  const currencyIcon =
    currencyOf(view.price) === "emeralds" ? (
      <EmeraldIcon width={iconSize} height={iconSize} />
    ) : (
      <CoinIcon width={iconSize} height={iconSize} />
    );

  if (view.mark === "complete") {
    return <Button label={t("shop.complete")} onPress={ignorePress} size="l" isDisabled />;
  }
  if (view.mark === "equipped") {
    return (
      <Button
        label={t("shop.equippedAction")}
        icon={<CheckIcon width={iconSize} height={iconSize} color={theme.colors.text.disabled} />}
        onPress={ignorePress}
        size="l"
        isDisabled
      />
    );
  }
  if (view.mark === "owned") {
    return (
      <Button
        testID="preview-equip"
        label={t("shop.equip")}
        caption={isOnline ? undefined : t("shop.needInternet")}
        onPress={onEquip}
        variant="primary"
        size="l"
        isDisabled={!isOnline}
      />
    );
  }
  if (isPending) {
    return <Button label={t("shop.buying")} onPress={ignorePress} size="l" isDisabled />;
  }
  return (
    <Button
      testID="preview-buy"
      label={formatNumber(amountOf(view.price), i18n.language)}
      accessibilityLabel={t(
        currencyOf(view.price) === "emeralds" ? "wallet.emeralds" : "wallet.coins",
        { count: amountOf(view.price) },
      )}
      caption={isOnline ? undefined : t("shop.needInternet")}
      icon={currencyIcon}
      onPress={onBuy}
      variant="primary"
      size="l"
      isLabelDanger={isShort}
      isDisabled={!isOnline}
    />
  );
};

export default PreviewMainAction;
