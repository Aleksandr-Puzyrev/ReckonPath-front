import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteMeMutationOptions, restoreMeMutationOptions, walletKeys } from "@entities/wallet";
import { errorMessageKey } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

type OnError = (messageKey: ErrorMessageKey) => void;

export const useDeleteAccount = (onScheduled: () => void, onError: OnError) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    ...deleteMeMutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: walletKeys.all });
      onScheduled();
    },
    onError: (error) => onError(errorMessageKey(error)),
  });

  return { remove: mutate, isPending };
};

export const useRestoreAccount = (onRestored: () => void, onError: OnError) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    ...restoreMeMutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: walletKeys.all });
      onRestored();
    },
    onError: (error) => onError(errorMessageKey(error)),
  });

  return { restore: () => mutate(), isPending };
};
