import type { BackendInventory, Inventory, InventoryEntry, Loadout } from "./item-type";
import { slotOfKind } from "./kind-slots";
import { shopItemOf } from "./shop-of";

const loadoutOf = (equipped: BackendInventory["equipped"]): Loadout =>
  Object.fromEntries(
    Object.entries(equipped).flatMap(([kind, key]) => {
      const slot = slotOfKind(kind);
      return slot === null || key === "" ? [] : [[slot, key]];
    }),
  );

export const inventoryOf = ({ items, equipped }: BackendInventory): Inventory => ({
  items: items
    .filter((view) => view.default !== true)
    .flatMap((view): InventoryEntry[] => {
      const item = shopItemOf(view);
      return item === null ? [] : [{ itemId: item.id, slot: item.slot, item }];
    }),
  loadout: loadoutOf(equipped),
});
