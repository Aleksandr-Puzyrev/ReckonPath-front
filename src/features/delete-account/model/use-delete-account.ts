import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteMeMutationOptions, restoreMeMutationOptions, walletKeys } from "@entities/wallet";
import { errorMessageKey, isApiError } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

type OnError = (messageKey: ErrorMessageKey) => void;

interface DeleteCallbacks {
  onDeleted: () => void;
  onWrongPassword: () => void;
  onError: OnError;
}

export const useDeleteAccount = ({ onDeleted, onWrongPassword, onError }: DeleteCallbacks) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    ...deleteMeMutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: walletKeys.all });
      onDeleted();
    },
    onError: (error) => {
      if (isApiError(error) && error.code === "wrong_password") {
        onWrongPassword();
        return;
      }
      onError(errorMessageKey(error));
    },
  });

  return { remove: mutate, isPending };
};

export const useRestoreAccount = (onRestored: () => void, onError: OnError) => {
  const queryClient = useQueryClient();
  const finish = async () => {
    await queryClient.invalidateQueries({ queryKey: walletKeys.all });
    onRestored();
  };
  const { mutate, isPending } = useMutation({
    ...restoreMeMutationOptions(),
    onSuccess: finish,
    onError: async (error) => {
      // Nothing is scheduled: the deletion is already cancelled (удаление не запланировано — значит, оно уже отменено).
      if (isApiError(error) && error.code === "not_scheduled") {
        await finish();
        return;
      }
      onError(errorMessageKey(error));
    },
  });

  return { restore: () => mutate(), isPending };
};
