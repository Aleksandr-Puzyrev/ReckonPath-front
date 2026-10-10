import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Gradient } from "@shared/ui/gradient";
import { Text } from "@shared/ui/text";

import type { ShopTabId } from "../model/shop-cards";

import { styles } from "./shop-tabs-styles";

interface IShopTabs {
  tabs: readonly ShopTabId[];
  selected: ShopTabId;
  onSelect: (tab: ShopTabId) => void;
}

const ShopTabs = ({ tabs, selected, onSelect }: IShopTabs) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="tablist"
    >
      {tabs.map((tab) => {
        const isSelected = tab === selected;
        return (
          <Pressable
            key={tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(tab)}
            style={[styles.tab, isSelected ? styles.selected : null]}
          >
            {isSelected ? <Gradient name="primary" radius={theme.radius.full} /> : null}
            <View>
              <Text variant="button.s" style={isSelected ? styles.selectedLabel : styles.label}>
                {t(`shop.tabs.${tab}`)}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

export default ShopTabs;
