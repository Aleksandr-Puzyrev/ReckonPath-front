import { useMutation, useQueryClient } from "@tanstack/react-query";

import { arenaKeys, claimSeasonSummaryMutationOptions } from "@entities/arena";
import { applyWallet } from "@entities/wallet";
import { errorMessageKey } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

// The arena is re-read only on finishing, so the summary stays on screen with «Получено» after a claim (арена перечитывается только при завершении, поэтому итог остаётся на экране с «Получено» после «Забрать»).
export const useClaimSeasonSummary = (onError: (messageKey: ErrorMessageKey) => void) => {
  const queryClient = useQueryClient();
  const { mutate, isPending, isSuccess } = useMutation({
    ...claimSeasonSummaryMutationOptions(),
    onSuccess: ({ wallet }) => applyWallet(queryClient, wallet),
    onError: (error) => onError(errorMessageKey(error)),
  });
  const refresh = () => void queryClient.invalidateQueries({ queryKey: arenaKeys.all });

  return {
    isPending,
    isClaimed: isSuccess,
    claim: () => mutate(),
    finish: () => {
      if (isSuccess) refresh();
      else mutate(undefined, { onSuccess: refresh });
    },
  };
};
