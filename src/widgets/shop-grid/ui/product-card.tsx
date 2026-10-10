import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { OfferPreview, formatCardLeft, offerViewOf } from "@entities/item";
import type { ShopOffer } from "@entities/item";
import { RarityTag } from "@shared/ui/rarity-tag";
import { Text } from "@shared/ui/text";

import ProductPrice from "./product-price";
import { styles } from "./product-card-styles";

interface IProductCard {
  card: ShopOffer;
  now: number;
  onPress: (card: ShopOffer) => void;
}

const ProductCard = ({ card, now, onPress }: IProductCard) => {
  const { t } = useTranslation();
  const view = offerViewOf(card);
  styles.useVariants({ rarity: view.rarity });
  const type = t(`shop.types.${view.slot}`);
  const typeLine = view.isVisibleInMatch ? `${type} · ${t("shop.inMatch")}` : type;
  const timer =
    view.availableTo === null ? null : formatCardLeft(t, Date.parse(view.availableTo) - now);
  const amount = "emeralds" in view.price ? view.price.emeralds : view.price.coins;
  const priceLabel =
    view.mark === null
      ? t("emeralds" in view.price ? "wallet.emeralds" : "wallet.coins", { count: amount })
      : t(`shop.${view.mark}`);
  // The card reads as one element, so its label carries everything the eye sees on it (карточка читается одним элементом, поэтому её подпись несёт всё, что видно глазу).
  const label = [view.name, typeLine, t(`shop.rarity.${view.rarity}`), priceLabel, timer]
    .filter((part) => part !== null)
    .join(", ");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => onPress(card)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View>
        <OfferPreview preview={view.preview} rarity={view.rarity} slot={view.slot} />
        {timer === null ? null : (
          <View style={styles.timer}>
            <Text variant="caption" style={styles.timerText}>
              {timer}
            </Text>
          </View>
        )}
      </View>
      <Text variant="title.s" numberOfLines={1}>
        {view.name}
      </Text>
      <Text variant="caption" style={styles.type} numberOfLines={1}>
        {typeLine}
      </Text>
      <RarityTag rarity={view.rarity} label={t(`shop.rarity.${view.rarity}`)} />
      <ProductPrice price={view.price} mark={view.mark} />
    </Pressable>
  );
};

export default ProductCard;
