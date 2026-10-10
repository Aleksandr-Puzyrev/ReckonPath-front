import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { PREVIEW_LEVEL } from "@entities/level";
import { Text } from "@shared/ui/text";
import { BoardPreview } from "@widgets/board";

import { styles } from "./shop-hero-styles";

const ShopHero = () => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <View style={styles.hero}>
      <View style={styles.texts}>
        <Text variant="eyebrow" style={styles.eyebrow}>
          {t("shop.eyebrow")}
        </Text>
        <Text variant="display.m" accessibilityRole="header">
          {t("shop.title")}
        </Text>
        <Text variant="body.s" style={styles.subtitle}>
          {t("shop.subtitle")}
        </Text>
      </View>
      {PREVIEW_LEVEL === undefined ? null : (
        <BoardPreview level={PREVIEW_LEVEL} size={theme.sizes.shop.heroBoard} />
      )}
    </View>
  );
};

export default ShopHero;
