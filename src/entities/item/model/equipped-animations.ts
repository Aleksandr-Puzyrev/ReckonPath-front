import type { Inventory } from "./item-type";

const EFFECT_SLOTS = ["fxClick", "fxReveal", "fxVictory"] as const;
export type EffectSlot = (typeof EFFECT_SLOTS)[number];

export const equippedAnimationsOf = (inventory: Inventory | undefined, theme: "light" | "dark") =>
  EFFECT_SLOTS.flatMap((slot) => {
    const id = inventory?.loadout[slot];
    const animation = inventory?.items.find(({ itemId }) => itemId === id)?.item.animation;
    return animation === undefined ? [] : [{ slot, animation: animation[theme] }];
  });
