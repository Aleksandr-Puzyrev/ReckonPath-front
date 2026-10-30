import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useEditorStore } from "@entities/arena-map";
import { useDailyRecordStore } from "@entities/daily";
import { useGameSessionStore } from "@entities/level";
import { useOutboxStore } from "@entities/outbox";
import { useProgressStore } from "@entities/progress";
import { endSession } from "@entities/session";
import { errorMessageKey } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

interface SignOutCallbacks {
  onSignedOut: () => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

// The account's data leaves the device with it; the new guest starts empty (данные аккаунта уходят с устройства вместе с ним; новый гость начинает с нуля).
const signOut = async () => {
  await endSession();
  useGameSessionStore.getState().reset();
  useOutboxStore.getState().reset();
  useProgressStore.getState().reset();
  useDailyRecordStore.getState().reset();
  useEditorStore.getState().reset();
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
