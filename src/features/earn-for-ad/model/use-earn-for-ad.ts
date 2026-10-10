import { useMutation, useQueryClient } from "@tanstack/react-query";

import { adKeys, useAdLimitsQuery, watchRewardedAd } from "@entities/ad";
import type { AdMessageKey } from "@entities/ad";
import { applyWallet, walletKeys } from "@entities/wallet";
import { errorMessageKey, isApiError, useIsOnline } from "@shared/api";

const LATE_RECHECK_MS = 60_000;

export const useEarnForAd = (onMessage: (messageKey: AdMessageKey) => void) => {
  const queryClient = useQueryClient();
  const isOnline = useIsOnline();
  const { data: limits } = useAdLimitsQuery();

  const refreshCounters = () => queryClient.invalidateQueries({ queryKey: adKeys.limits() });

  const { mutate, isPending } = useMutation({
    mutationKey: ["ad", "earn"],
    mutationFn: () => watchRewardedAd("gems"),
    networkMode: "always",
    onSuccess: (outcome) => {
      if (outcome.kind === "unavailable") {
        onMessage("ads.unavailable");
        return;
      }
      if (outcome.kind === "late") {
        onMessage("ads.rewardLater");
        // A late SSV still credits on the server; one more look a minute later picks it up (поздний SSV всё равно начислит на сервере; ещё один взгляд через минуту его подхватит).
        setTimeout(() => {
          void queryClient.invalidateQueries({ queryKey: walletKeys.all });
          void refreshCounters();
        }, LATE_RECHECK_MS);
        return;
      }
      if (outcome.status.wallet !== undefined) applyWallet(queryClient, outcome.status.wallet);
      void refreshCounters();
    },
    onError: (error) => {
      if (isApiError(error) && error.code === "LIMIT_REACHED") {
        void refreshCounters();
        return;
      }
      onMessage(errorMessageKey(error));
    },
  });

  const gems = limits?.gems;
  return {
    used: gems?.used ?? 0,
    max: gems?.max ?? 0,
    isLimitReached: gems !== undefined && gems.used >= gems.max,
    isOnline,
    isPending,
    handleWatch: () => mutate(),
  };
};
