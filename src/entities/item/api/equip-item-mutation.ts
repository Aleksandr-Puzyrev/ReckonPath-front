import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

import { inventoryOf } from "../model/inventory-of";
import type { Slot } from "../model/item-type";
import { kindOfSlot } from "../model/kind-slots";

interface EquipChange {
  slot: Slot;
  itemId: string | null;
}

export const equipItemMutationOptions = () =>
  mutationOptions({
    mutationKey: ["item", "equip"],
    mutationFn: async ({ slot, itemId }: EquipChange) =>
      inventoryOf(
        readData(
          await apiClient.PUT("/me/equipment", {
            body: { slot: kindOfSlot(slot), item: itemId ?? "" },
          }),
        ),
      ),
  });
