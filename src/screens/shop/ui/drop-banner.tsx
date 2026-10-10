import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { formatDropLeft } from "@entities/item";
import type { Shop } from "@entities/item";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { styles } from "./drop-banner-styles";

interface IDropBanner {
  featured: NonNullable<Shop["featured"]>;
  now: number;
  onOpen: () => void;
}

const DropBanner = ({ featured, now, onOpen }: IDropBanner) => {
  const { t } = useTranslation();

  return (
    <View style={styles.banner}>
      <View style={styles.top}>
        <Text variant="eyebrow" style={styles.label}>
          {t("shop.drop.label")}
        </Text>
        <View style={styles.timer}>
          <Text variant="eyebrow" style={styles.timerText}>
            {formatDropLeft(t, Date.parse(featured.endsAt) - now)}
          </Text>
        </View>
      </View>
      <Text variant="title.l" accessibilityRole="header">
        {featured.title}
      </Text>
      <Text variant="body.s" style={styles.subtitle}>
        {featured.subtitle}
      </Text>
      <Button label={t("shop.drop.open")} onPress={onOpen} variant="primary" />
    </View>
  );
};

export default DropBanner;
