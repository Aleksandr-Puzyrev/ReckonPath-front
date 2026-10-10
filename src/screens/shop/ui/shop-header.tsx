import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { Shop } from "@entities/item";
import { Text } from "@shared/ui/text";
import { HideOwnedChip, ShopTabs } from "@widgets/shop-grid";
import type { ShopTabId } from "@widgets/shop-grid";

import DropBanner from "./drop-banner";
import { styles } from "./shop-header-styles";
import ShopHero from "./shop-hero";

interface IShopHeader {
  featured: Shop["featured"];
  now: number;
  tabs: readonly ShopTabId[];
  tab: ShopTabId | null;
  isOwnedHidden: boolean;
  updatedAtText: string | null;
  onDropOpen: () => void;
  onTabSelect: (tab: ShopTabId) => void;
  onOwnedToggle: () => void;
}

const ShopHeader = ({
  featured,
  now,
  tabs,
  tab,
  isOwnedHidden,
  updatedAtText,
  onDropOpen,
  onTabSelect,
  onOwnedToggle,
}: IShopHeader) => {
  const { t } = useTranslation();

  return (
    <View style={styles.header}>
      <ShopHero />
      {featured === null ? null : <DropBanner featured={featured} now={now} onOpen={onDropOpen} />}
      {updatedAtText === null ? null : (
        <Text variant="caption" style={styles.updated}>
          {updatedAtText}
        </Text>
      )}
      {tab === null ? null : (
        <>
          <ShopTabs tabs={tabs} selected={tab} onSelect={onTabSelect} />
          <View style={styles.controls}>
            <Text variant="eyebrow" style={styles.tabTitle}>
              {t(`shop.tabs.${tab}`)}
            </Text>
            <HideOwnedChip isOn={isOwnedHidden} onToggle={onOwnedToggle} />
          </View>
        </>
      )}
    </View>
  );
};

export default ShopHeader;
