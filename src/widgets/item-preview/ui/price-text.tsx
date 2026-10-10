import { Trans, useTranslation } from "react-i18next";
import type { TextStyle } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { amountOf, currencyOf } from "@entities/item";
import type { Price } from "@entities/item";
import { formatNumber } from "@shared/lib";
import type { TypographyVariant } from "@shared/theme";
import { Text } from "@shared/ui/text";

import CoinIcon from "@assets/icons/play/coin.svg";
import EmeraldIcon from "@assets/icons/play/emerald.svg";

type PriceTextKey = "shop.confirm.title" | "shop.confirm.left" | "shop.success.balance";

interface IPriceText {
  i18nKey: PriceTextKey;
  price: Price;
  item?: string;
  variant: TypographyVariant;
  style?: TextStyle;
}

// The currency is an icon inside the sentence, so the text keeps it as a tag (валюта — иконка внутри фразы, поэтому текст хранит её тегом).
const PriceText = ({ i18nKey, price, item, variant, style }: IPriceText) => {
  const { i18n } = useTranslation();
  const { theme } = useUnistyles();
  const iconSize = theme.sizes.icon.s;
  const icon =
    currencyOf(price) === "emeralds" ? (
      <EmeraldIcon width={iconSize} height={iconSize} />
    ) : (
      <CoinIcon width={iconSize} height={iconSize} />
    );

  return (
    <Text variant={variant} style={style}>
      <Trans
        i18nKey={i18nKey}
        values={{ amount: formatNumber(amountOf(price), i18n.language), item }}
        components={{ icon }}
      />
    </Text>
  );
};

export default PriceText;
