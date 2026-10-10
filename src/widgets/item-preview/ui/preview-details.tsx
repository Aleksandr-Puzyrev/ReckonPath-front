import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { OfferPreview, amountOf, formatCardLeft, isBoardSlot, offerViewOf } from "@entities/item";
import type { ShopItem, ShopOffer } from "@entities/item";
import { formatNumber } from "@shared/lib";
import { RarityTag } from "@shared/ui/rarity-tag";
import { Text } from "@shared/ui/text";

import type { PreviewLook, PreviewTheme } from "../model/preview-look";

import BundleParts from "./bundle-parts";
import { styles } from "./preview-details-styles";
import ThemeSwitch from "./theme-switch";

interface IPreviewDetails {
  offer: ShopOffer;
  items: readonly ShopItem[];
  renderBoard: (look: PreviewLook) => ReactNode;
  now: number;
}

const PreviewDetails = ({ offer, items, renderBoard, now }: IPreviewDetails) => {
  const { t, i18n } = useTranslation();
  const { rt } = useUnistyles();
  const [theme, setTheme] = useState<PreviewTheme>(rt.themeName === "light" ? "light" : "dark");
  const view = offerViewOf(offer);
  const description = offer.kind === "item" ? offer.item.description : offer.bundle.description;
  const isDiscounted =
    offer.kind === "bundle" && amountOf(offer.bundle.basePrice) > amountOf(offer.bundle.price);

  return (
    <View style={styles.details}>
      <View style={styles.tags}>
        <Text variant="eyebrow" style={styles.type}>
          {t(`shop.types.${view.slot}`)}
        </Text>
        <RarityTag rarity={view.rarity} label={t(`shop.rarity.${view.rarity}`)} />
      </View>
      <Text variant="title.l" accessibilityRole="header">
        {view.name}
      </Text>
      <Text variant="body.s" style={styles.secondary} numberOfLines={2}>
        {description}
      </Text>
      {view.availableTo === null ? null : (
        <Text variant="caption" style={styles.timer}>
          {t("shop.preview.left", { time: formatCardLeft(t, Date.parse(view.availableTo) - now) })}
        </Text>
      )}
      <View style={styles.visual}>
        {isBoardSlot(view.slot) && offer.kind === "item" ? (
          <>
            {renderBoard({ packageUrl: offer.item.package.url, theme })}
            <ThemeSwitch theme={theme} onChange={setTheme} />
          </>
        ) : (
          <View style={styles.placeholder}>
            <OfferPreview preview={view.preview} rarity={view.rarity} slot={view.slot} />
          </View>
        )}
      </View>
      {offer.kind === "bundle" ? <BundleParts bundle={offer.bundle} items={items} /> : null}
      {isDiscounted && offer.kind === "bundle" ? (
        <Text variant="body.s" style={styles.strike}>
          {formatNumber(amountOf(offer.bundle.basePrice), i18n.language)}
        </Text>
      ) : null}
    </View>
  );
};

export default PreviewDetails;
