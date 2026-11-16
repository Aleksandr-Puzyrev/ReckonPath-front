import { useCampaignQuery } from "@entities/level";
import type { CampaignOverview } from "@entities/level";

// The server's default until GET /campaign answers (значение сервера по умолчанию, пока GET /campaign не ответил).
const DEFAULT_UNLOCK_LEVEL = 12;

export const arenaUnlockOf = (overview: CampaignOverview | undefined) => {
  const unlockLevel = overview?.unlocks.arenaLevel ?? DEFAULT_UNLOCK_LEVEL;
  const passed = (overview?.worlds ?? [])
    .flatMap(({ levels }) => levels)
    .filter(
      ({ number, state }) => number <= unlockLevel && (state === "done" || state === "perfect"),
    ).length;
  return { isUnlocked: overview?.unlocks.arena ?? false, unlockLevel, passed };
};

export const useArenaUnlock = () => arenaUnlockOf(useCampaignQuery().data);
