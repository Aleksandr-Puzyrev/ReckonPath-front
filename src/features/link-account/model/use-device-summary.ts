import { CAMPAIGN_WORLDS } from "@entities/level";
import { campaignStars, useProgressStore } from "@entities/progress";
import { useMeQuery } from "@entities/wallet";

import type { ProgressCard } from "./progress-card";

// TODO: show the guest's league once the arena exists on the client
export const useDeviceSummary = (): ProgressCard | null => {
  const { data: me } = useMeQuery();
  const best = useProgressStore((state) => state.best);
  if (me === undefined) return null;
  return {
    name: me.nickname,
    level: me.level,
    stars: campaignStars(CAMPAIGN_WORLDS, best),
    league: null,
  };
};
