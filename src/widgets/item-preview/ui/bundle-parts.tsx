import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { Bundle, ShopItem } from "@entities/item";
import { Text } from "@shared/ui/text";

import { styles } from "./bundle-parts-styles";

interface IBundleParts {
  bundle: Bundle;
  items: readonly ShopItem[];
}

const BundleParts = ({ bundle, items }: IBundleParts) => {
  const { t } = useTranslation();

  return (
    <View style={styles.parts}>
      {bundle.items.map((id) => (
        <View key={id} style={styles.part}>
          <Text variant="body.m" style={styles.name} numberOfLines={1}>
            {items.find((item) => item.id === id)?.name ?? id}
          </Text>
          {bundle.ownedItems.includes(id) ? (
            <Text variant="caption" style={styles.have}>
              {t("shop.preview.have")}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
};

export default BundleParts;
