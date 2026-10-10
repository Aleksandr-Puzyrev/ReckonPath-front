import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

import { equipItemMutationOptions, itemKeys, shopQueryOptions } from "@entities/item";
import type { Loadout, Shop, Slot } from "@entities/item";
import { meQueryOptions } from "@entities/wallet";
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

const MAX_BADGES = 3;

const changeOf = ({ id, slot }: EquipTarget, loadout: Loadout | undefined): Loadout =>
  slot === "badges"
    ? {
        badges: [...(loadout?.badges ?? []).filter((badge) => badge !== id), id].slice(-MAX_BADGES),
      }
    : { [slot]: id };

const changesOf = (targets: readonly EquipTarget[], loadout: Loadout | undefined): Loadout =>
  targets.reduce<Loadout>((change, target) => ({ ...change, ...changeOf(target, loadout) }), {});

const isEquippedBy = (change: Loadout, { id, slot }: { id: string; slot: Slot }) => {
  const value = change[slot];
  return Array.isArray(value) ? value.includes(id) : value === id;
};

const withEquipped = (shop: Shop, change: Loadout): Shop => ({
  ...shop,
  tabs: shop.tabs.map((tab) => ({
    ...tab,
    items: tab.items.map((item) =>
      change[item.slot] === undefined ? item : { ...item, equipped: isEquippedBy(change, item) },
    ),
  })),
});

// Equip is the one optimistic write: the board changes at once and rolls back on an error (экипировка — единственная оптимистичная запись: вид меняется сразу и откатывается при ошибке).
export const useEquipItem = ({ onEquipped, onError }: EquipCallbacks) => {
  const queryClient = useQueryClient();
  const shopKey = shopQueryOptions().queryKey;
  const meKey = meQueryOptions().queryKey;
  const nameRef = useRef("");

  const { mutate, isPending } = useMutation({
    ...equipItemMutationOptions(),
    onMutate: async (change: Loadout) => {
      await queryClient.cancelQueries({ queryKey: itemKeys.all });
      const shop = queryClient.getQueryData(shopKey);
      const me = queryClient.getQueryData(meKey);
      if (shop !== undefined) queryClient.setQueryData(shopKey, withEquipped(shop, change));
      if (me !== undefined) {
        queryClient.setQueryData(meKey, { ...me, loadout: { ...me.loadout, ...change } });
      }
      return { shop, me };
    },
    onError: (error, _change, context) => {
      if (context?.shop !== undefined) queryClient.setQueryData(shopKey, context.shop);
      if (context?.me !== undefined) queryClient.setQueryData(meKey, context.me);
      onError(errorMessageKey(error));
    },
    // Here and not in mutate(): the toast must come even when the preview closed before the answer (здесь, а не в mutate(): тост должен прийти, даже если превью закрыли до ответа).
    onSuccess: () => onEquipped(nameRef.current),
    onSettled: () => queryClient.invalidateQueries({ queryKey: itemKeys.all }),
  });

  // A bundle equips all its parts at once (набор экипирует все свои части сразу).
  const equip = (targets: readonly EquipTarget[], name: string) => {
    nameRef.current = name;
    mutate(changesOf(targets, queryClient.getQueryData(meKey)?.loadout));
  };

  const reset = (slot: Slot, name: string) => {
    nameRef.current = name;
    mutate(slot === "badges" ? { badges: [] } : { [slot]: null });
  };

  return { equip, reset, isPending };
};
