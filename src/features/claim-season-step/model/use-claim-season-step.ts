import { useMutation, useQueryClient } from "@tanstack/react-query";

import { applySeason, claimTrackStepMutationOptions } from "@entities/arena";
import { applyWallet } from "@entities/wallet";
import { errorMessageKey } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

export const useClaimSeasonStep = (onError: (messageKey: ErrorMessageKey) => void) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, variables } = useMutation({
    ...claimTrackStepMutationOptions(),
    onSuccess: ({ wallet, season }) => {
      applyWallet(queryClient, { coins: wallet.coins, emeralds: wallet.gems });
      applySeason(queryClient, season);
    },
    onError: (error) => onError(errorMessageKey(error)),
  });

  return { claim: mutate, pendingStep: isPending ? (variables ?? null) : null };
};
