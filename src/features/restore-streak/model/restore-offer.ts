import type { StreakView } from "@entities/streak";

export type RestoreOffer =
  { kind: "restorable"; lost: number; price: number } | { kind: "weekly"; lost: number } | null;

// The server breaks a streak by a single missed day and says whether it can come back; otherwise the weekly limit is why (сервер обрывает серию одним пропущенным днём и говорит, можно ли её вернуть; иначе причина — недельный лимит).
export const restoreOfferOf = (streak: StreakView | undefined): RestoreOffer => {
  const lost = streak?.broken ?? 0;
  if (streak === undefined || lost === 0) return null;
  if (!streak.restorable) return { kind: "weekly", lost };
  return { kind: "restorable", lost, price: streak.restoreCost };
};
