import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { OfferPreview } from "@entities/item";
import type { InventoryEntry, Loadout } from "@entities/item";
import { Text } from "@shared/ui/text";

import { COLLECTION_SLOTS, equippedEntryOf } from "../model/collection-slots";
import type { CollectionSlot } from "../model/collection-slots";

import { styles } from "./collection-grid-styles";

interface ICollectionGrid {
  loadout: Loadout;
  inventory: readonly InventoryEntry[];
  onSlotPress: (slot: CollectionSlot) => void;
}

const CollectionGrid = ({ loadout, inventory, onSlotPress }: ICollectionGrid) => {
  const { t } = useTranslation();

  return (
    <View style={styles.grid}>
      {COLLECTION_SLOTS.map((slot) => {
        const equipped = equippedEntryOf(slot, loadout, inventory);
        const label = t(`profile.slots.${slot}`);
        return (
          <Pressable
            key={slot}
            testID={`collection-${slot}`}
            accessibilityRole="button"
            accessibilityLabel={t("profile.slotLabel", {
              slot: label,
              item: equipped?.item.name ?? t("profile.default"),
            })}
            onPress={() => onSlotPress(slot)}
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
          >
            <OfferPreview
              preview={equipped?.item.preview ?? ""}
              rarity={equipped?.item.rarity ?? "common"}
              slot={slot}
            />
            <Text variant="caption" style={styles.label} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default CollectionGrid;
