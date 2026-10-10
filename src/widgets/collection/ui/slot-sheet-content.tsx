import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { useEquipItem } from "@features/equip-item";
import { OfferPreview, isBoardSlot } from "@entities/item";
import type { InventoryEntry, Loadout } from "@entities/item";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import ChevronRightIcon from "@assets/icons/levels/chevron-right.svg";

import { equippedEntryOf, slotOptionsOf } from "../model/collection-slots";
import type { CollectionSlot } from "../model/collection-slots";

import { styles } from "./slot-sheet-styles";

interface ISlotSheetContent {
  slot: CollectionSlot;
  loadout: Loadout;
  inventory: readonly InventoryEntry[];
  isOnline: boolean;
  renderBoard: (packageUrl: string | null) => ReactNode;
  onOpenShop: () => void;
  onToast: (text: string) => void;
}

const SlotSheetContent = ({
  slot,
  loadout,
  inventory,
  isOnline,
  renderBoard,
  onOpenShop,
  onToast,
}: ISlotSheetContent) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { equip, reset } = useEquipItem({
    onEquipped: (name) => onToast(t("shop.equippedToast", { item: name })),
    onError: (messageKey) => onToast(t(messageKey)),
  });

  const options = slotOptionsOf(slot, loadout, inventory);
  const equipped = equippedEntryOf(slot, loadout, inventory);
  const isDefault = equipped === null;
  const iconSize = theme.sizes.icon.m;

  return (
    <View style={styles.content}>
      <Text variant="title.l" accessibilityRole="header">
        {t(`profile.slots.${slot}`)}
      </Text>
      {isBoardSlot(slot) ? (
        <View style={styles.visual}>{renderBoard(equipped?.item.package.url ?? null)}</View>
      ) : null}
      <Pressable
        testID="slot-default"
        accessibilityRole="radio"
        accessibilityState={{ selected: isDefault, disabled: !isOnline }}
        disabled={!isOnline || isDefault}
        onPress={() => reset(slot, t("profile.default"))}
        style={[styles.option, isDefault ? styles.selected : null]}
      >
        <Text variant="body.m" style={styles.name}>
          {t("profile.default")}
        </Text>
        {isDefault ? (
          <Text variant="caption" style={styles.equipped}>
            {t("profile.equipped")}
          </Text>
        ) : null}
      </Pressable>
      {options.map(({ entry, isEquipped }) => (
        <Pressable
          key={entry.itemId}
          testID={`slot-${entry.itemId}`}
          accessibilityRole="radio"
          accessibilityState={{ selected: isEquipped, disabled: !isOnline }}
          disabled={!isOnline || isEquipped}
          onPress={() => equip([{ id: entry.itemId, slot }], entry.item.name)}
          style={[styles.option, isEquipped ? styles.selected : null]}
        >
          <View style={styles.thumb}>
            <OfferPreview preview={entry.item.preview} rarity={entry.item.rarity} slot={slot} />
          </View>
          <Text variant="body.m" style={styles.name} numberOfLines={1}>
            {entry.item.name}
          </Text>
          <Text variant="caption" style={isEquipped ? styles.equipped : styles.have}>
            {isEquipped ? t("profile.equipped") : t("profile.have")}
          </Text>
        </Pressable>
      ))}
      {isOnline ? null : (
        <Text variant="caption" style={styles.have}>
          {t("shop.needInternet")}
        </Text>
      )}
      <Button
        label={t("profile.moreInShop")}
        icon={
          <ChevronRightIcon width={iconSize} height={iconSize} color={theme.colors.accent.cyan} />
        }
        onPress={onOpenShop}
        variant="ghost"
      />
    </View>
  );
};

export default SlotSheetContent;
