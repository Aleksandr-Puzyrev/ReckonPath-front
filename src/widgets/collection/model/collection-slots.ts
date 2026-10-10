import type { InventoryEntry, Loadout, Slot } from "@entities/item";

export const COLLECTION_SLOTS = [
  "field",
  "fence",
  "stream",
  "rock",
  "x2",
  "bridge",
  "bomb",
  "target",
  "avatar",
  "frame",
  "title",
] as const satisfies readonly Slot[];

export type CollectionSlot = (typeof COLLECTION_SLOTS)[number];

export interface SlotOption {
  entry: InventoryEntry;
  isEquipped: boolean;
}

export const slotOptionsOf = (
  slot: CollectionSlot,
  loadout: Loadout,
  inventory: readonly InventoryEntry[],
): SlotOption[] =>
  inventory
    .filter((entry) => entry.slot === slot)
    .map((entry) => ({ entry, isEquipped: loadout[slot] === entry.itemId }));

export const equippedEntryOf = (
  slot: CollectionSlot,
  loadout: Loadout,
  inventory: readonly InventoryEntry[],
) => slotOptionsOf(slot, loadout, inventory).find(({ isEquipped }) => isEquipped)?.entry ?? null;
