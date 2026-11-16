import { useMutation, useQueryClient } from "@tanstack/react-query";

import { applySeason, claimSeasonResultMutationOptions } from "@entities/arena";
import { applyWallet } from "@entities/wallet";
import { errorMessageKey } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

// The new season replaces the old one only on finishing, so the summary stays with «Получено» after a claim; a skipped season brings the next result (новый сезон заменяет старый только при завершении, поэтому итог остаётся с «Получено» после «Забрать»; пропущенный сезон приносит следующий итог).
export const useClaimSeasonSummary = (onError: (messageKey: ErrorMessageKey) => void) => {
  const queryClient = useQueryClient();
  const { mutate, isPending, isSuccess, data } = useMutation({
    ...claimSeasonResultMutationOptions(),
    onSuccess: ({ wallet }) =>
      applyWallet(queryClient, { coins: wallet.coins, emeralds: wallet.gems }),
    onError: (error) => onError(errorMessageKey(error)),
  });

  return {
    isPending,
    isClaimed: isSuccess,
    claim: () => mutate(),
    finish: () => {
      if (data !== undefined) {
        applySeason(queryClient, data.season);
        return;
      }
      mutate(undefined, { onSuccess: ({ season }) => applySeason(queryClient, season) });
    },
  };
};
