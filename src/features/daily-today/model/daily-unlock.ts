import { useCampaignQuery } from "@entities/level";
import type { CampaignOverview } from "@entities/level";

// The server's default until GET /campaign answers (значение сервера по умолчанию, пока GET /campaign не ответил).
const DEFAULT_UNLOCK_LEVEL = 6;

export const dailyUnlockOf = (overview: CampaignOverview | undefined) => ({
  isUnlocked: overview?.unlocks.daily ?? false,
  unlockLevel: overview?.unlocks.dailyLevel ?? DEFAULT_UNLOCK_LEVEL,
});

export const useDailyUnlock = () => {
  const { data, isLoading } = useCampaignQuery();
  return { ...dailyUnlockOf(data), isLoading };
};
