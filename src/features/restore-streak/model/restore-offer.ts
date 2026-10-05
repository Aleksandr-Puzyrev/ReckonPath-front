import type { components } from "@shared/api";

type StreakState = components["schemas"]["StreakState"];

export type RestoreOffer =
  | { kind: "restorable"; lost: number; price: number; restoreUntil: string | null }
  | { kind: "weekly"; lost: number }
  | null;

// Only a single missed day can be restored; with restore unavailable then, the weekly limit is why (восстановить можно только один пропущенный день; если тогда оно недоступно, причина — недельный лимит).
export const restoreOfferOf = (
  streak: StreakState | undefined,
  dayBeforeYesterdayKey: string,
): RestoreOffer => {
  if (streak === undefined || streak.current === 0) return null;
  if (streak.lastDay !== dayBeforeYesterdayKey) return null;
  if (!streak.restorable) return { kind: "weekly", lost: streak.current };
  if (streak.price === undefined) return null;
  return {
    kind: "restorable",
    lost: streak.current,
    price: streak.price,
    restoreUntil: streak.restoreUntil ?? null,
  };
};
