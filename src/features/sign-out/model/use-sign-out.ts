import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useEditorStore } from "@entities/arena-map";
import { useDailyRecordStore } from "@entities/daily";
import { useGameSessionStore } from "@entities/level";
import { useOutboxStore } from "@entities/outbox";
import { useProgressStore } from "@entities/progress";
import { endSession, ensureSession } from "@entities/session";
import { errorMessageKey } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

interface SignOutCallbacks {
  onSignedOut: () => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

// The account's data is dropped before the new guest signs in, so the attempts sync does not hand it to the guest (данные аккаунта удаляются до входа нового гостя, чтобы синхронизация попыток не передала их гостю).
const signOut = async () => {
  await endSession();
  useGameSessionStore.getState().reset();
  useOutboxStore.getState().reset();
  useProgressStore.getState().reset();
  useDailyRecordStore.getState().reset();
  useEditorStore.getState().reset();
  await ensureSession();
};

export const useSignOut = ({ onSignedOut, onError }: SignOutCallbacks) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: signOut,
    onSuccess: async () => {
      await queryClient.resetQueries();
      onSignedOut();
    },
    onError: (error) => onError(errorMessageKey(error)),
  });

  return { signOut: () => mutate(), isPending };
};
