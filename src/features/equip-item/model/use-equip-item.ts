import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

import {
  equipItemMutationOptions,
  inventoryQueryOptions,
  itemKeys,
  shopQueryOptions,
} from "@entities/item";
import type { Inventory, Shop, Slot } from "@entities/item";
import { errorMessageKey } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

export interface EquipTarget {
  id: string;
  slot: Slot;
}

export interface EquipCallbacks {
  onEquipped: (name: string) => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

interface EquipChange {
  slot: Slot;
  itemId: string | null;
}

const withEquipped = (shop: Shop, { slot, itemId }: EquipChange): Shop => ({
  ...shop,
  tabs: shop.tabs.map((tab) => ({
    ...tab,
    items: tab.items.map((item) =>
      item.slot === slot ? { ...item, equipped: item.id === itemId } : item,
    ),
  })),
});

const withLoadout = (inventory: Inventory, { slot, itemId }: EquipChange): Inventory => ({
  ...inventory,
  loadout: { ...inventory.loadout, [slot]: itemId ?? undefined },
});

// Equip is the one optimistic write: the board changes at once and rolls back on an error (экипировка — единственная оптимистичная запись: вид меняется сразу и откатывается при ошибке).
export const useEquipItem = ({ onEquipped, onError }: EquipCallbacks) => {
  const queryClient = useQueryClient();
  const shopKey = shopQueryOptions().queryKey;
  const inventoryKey = inventoryQueryOptions().queryKey;
  const nameRef = useRef("");

  const { mutate, isPending } = useMutation({
    ...equipItemMutationOptions(),
    onMutate: async (change: EquipChange) => {
      await queryClient.cancelQueries({ queryKey: itemKeys.all });
      const shop = queryClient.getQueryData(shopKey);
      const inventory = queryClient.getQueryData(inventoryKey);
      if (shop !== undefined) queryClient.setQueryData(shopKey, withEquipped(shop, change));
      if (inventory !== undefined) {
        queryClient.setQueryData(inventoryKey, withLoadout(inventory, change));
      }
      return { shop, inventory };
    },
    onError: (error, _change, context) => {
      if (context?.shop !== undefined) queryClient.setQueryData(shopKey, context.shop);
      if (context?.inventory !== undefined) {
        queryClient.setQueryData(inventoryKey, context.inventory);
      }
      onError(errorMessageKey(error));
    },
    // Here and not in mutate(): the toast must come even when the preview closed before the answer (здесь, а не в mutate(): тост должен прийти, даже если превью закрыли до ответа).
    onSuccess: () => onEquipped(nameRef.current),
    onSettled: () => queryClient.invalidateQueries({ queryKey: itemKeys.all }),
  });

  const equip = ({ id, slot }: EquipTarget, name: string) => {
    nameRef.current = name;
    mutate({ slot, itemId: id });
  };

  const reset = (slot: Slot, name: string) => {
    nameRef.current = name;
    mutate({ slot, itemId: null });
  };

  return { equip, reset, isPending };
};
