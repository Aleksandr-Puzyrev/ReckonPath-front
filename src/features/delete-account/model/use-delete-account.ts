import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useDailyRecordStore } from "@entities/daily";
import { useGameSessionStore } from "@entities/level";
import { useOutboxStore } from "@entities/outbox";
import { useProgressStore } from "@entities/progress";
import { leaveAccount } from "@entities/session";
import { deleteMeMutationOptions, restoreMeMutationOptions, walletKeys } from "@entities/wallet";
import { useEditorStore } from "@entities/arena-map";
import { errorMessageKey, isApiError } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

type OnError = (messageKey: ErrorMessageKey) => void;

interface DeleteCallbacks {
  onDeleted: (purgeAfter: string) => void;
  onWrongPassword: () => void;
  onError: OnError;
}

// The server ends every session of the deleted account, so the device turns into a new guest without a sign-out (сервер завершает все сессии удалённого аккаунта, поэтому устройство становится новым гостем без выхода).
const forgetAccount = async () => {
  await leaveAccount();
  useGameSessionStore.getState().reset();
  useOutboxStore.getState().reset();
  useProgressStore.getState().reset();
  useDailyRecordStore.getState().reset();
  useEditorStore.getState().reset();
};

export const useDeleteAccount = ({ onDeleted, onWrongPassword, onError }: DeleteCallbacks) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    ...deleteMeMutationOptions(),
    onSuccess: async ({ purgeAfter }) => {
      await forgetAccount();
      await queryClient.resetQueries();
      onDeleted(purgeAfter);
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
