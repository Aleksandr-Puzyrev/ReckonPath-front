import { useMutation, useQueryClient } from "@tanstack/react-query";

import { arenaKeys, claimSeasonStepMutationOptions } from "@entities/arena";
import { applyWallet } from "@entities/wallet";
import { errorMessageKey } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

export const useClaimSeasonStep = (onError: (messageKey: ErrorMessageKey) => void) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, variables } = useMutation({
    ...claimSeasonStepMutationOptions(),
    onSuccess: ({ wallet }) => {
      if (wallet !== undefined) applyWallet(queryClient, wallet);
    },
    onError: (error) => onError(errorMessageKey(error)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: arenaKeys.all }),
  });

  return { claim: mutate, pendingStep: isPending ? (variables ?? null) : null };
};
