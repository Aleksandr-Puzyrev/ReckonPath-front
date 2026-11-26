import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

import { equippedAnimationsOf } from "../model/equipped-animations";
import { inventoryOf } from "../model/inventory-of";
import type { Slot } from "../model/item-type";
import { kindOfSlot } from "../model/kind-slots";

import { shopAnimationOptions } from "./animation-query";

interface EquipChange {
  slot: Slot;
  itemId: string | null;
}

export const equipItemMutationOptions = () =>
  mutationOptions({
    mutationKey: ["item", "equip"],
    mutationFn: async ({ slot, itemId }: EquipChange, { client }) => {
      const inventory = inventoryOf(
        readData(
          await apiClient.PUT("/me/equipment", {
            body: { slot: kindOfSlot(slot), item: itemId ?? "" },
          }),
        ),
      );
      const urls = new Set(
        (["light", "dark"] as const).flatMap((theme) =>
          equippedAnimationsOf(inventory, theme).map(({ animation }) => animation.url),
        ),
      );
      for (const url of urls) void client.prefetchQuery(shopAnimationOptions(url));
      return inventory;
    },
  });
