import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import type { OfferMark, Price } from "@entities/item";
import { formatNumber } from "@shared/lib";
import { Text } from "@shared/ui/text";

import CoinIcon from "@assets/icons/play/coin.svg";
import EmeraldIcon from "@assets/icons/play/emerald.svg";

import { styles } from "./product-price-styles";

interface IProductPrice {
  price: Price;
  mark: OfferMark | null;
}

const ProductPrice = ({ price, mark }: IProductPrice) => {
  const { t, i18n } = useTranslation();
  const { theme } = useUnistyles();
  styles.useVariants({ isEquipped: mark === "equipped" });
  const iconSize = theme.sizes.icon.s;

  if (mark !== null) {
    return (
      <Text variant="caption" style={styles.mark}>
        {t(`shop.${mark}`)}
      </Text>
    );
  }

  const isEmeralds = "emeralds" in price;
  const amount = isEmeralds ? price.emeralds : price.coins;
  return (
    <View style={styles.price}>
      {isEmeralds ? (
        <EmeraldIcon width={iconSize} height={iconSize} />
      ) : (
        <CoinIcon width={iconSize} height={iconSize} />
      )}
      <Text variant="title.s" style={styles.amount}>
        {formatNumber(amount, i18n.language)}
      </Text>
    </View>
  );
};

export default ProductPrice;
