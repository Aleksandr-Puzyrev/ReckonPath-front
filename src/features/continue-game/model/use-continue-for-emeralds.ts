import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uuidv7 } from "uuidv7";

import type { AdMessageKey } from "@entities/ad";
import { useGameSessionStore } from "@entities/level";
import { applyWallet, useWalletQuery } from "@entities/wallet";
import { errorMessageKey, isApiError, useIsOnline } from "@shared/api";
import { CONTINUE_GEM_PRICE } from "@shared/config";
import { haptic } from "@shared/haptics";

import { continueForEmeraldsMutationOptions } from "../api/continue-mutation";

export interface ContinueCallbacks {
  onContinued: () => void;
  onShortOfEmeralds: (need: number) => void;
  onError: (messageKey: AdMessageKey) => void;
}

const needOf = (details: Record<string, unknown>, fallback: number) =>
  typeof details.need === "number" ? details.need : fallback;

export const useContinueForEmeralds = ({
  onContinued,
  onShortOfEmeralds,
  onError,
}: ContinueCallbacks) => {
  const queryClient = useQueryClient();
  const { data: wallet } = useWalletQuery();
  const isOnline = useIsOnline();
  const emeralds = wallet?.emeralds ?? 0;
  const shortBy = Math.max(0, CONTINUE_GEM_PRICE - emeralds);

  const applyContinue = () => {
    useGameSessionStore.getState().continueGame("emeralds");
    haptic("success");
    onContinued();
  };

  const { mutate, isPending } = useMutation({
    ...continueForEmeraldsMutationOptions(),
    onSuccess: ({ wallet: next }) => {
      applyWallet(queryClient, next);
      applyContinue();
    },
    onError: (error) => {
      if (isApiError(error) && error.code === "INSUFFICIENT_FUNDS") {
        onShortOfEmeralds(needOf(error.details, shortBy));
        return;
      }
      onError(errorMessageKey(error));
    },
  });

  // Offline the continue is taken on the last known balance; the server charges it with the attempt (без сети продолжение берётся по последнему известному балансу, сервер спишет его вместе с попыткой).
  const handlePress = () => {
    if (shortBy > 0) {
      onShortOfEmeralds(shortBy);
      return;
    }
    if (!isOnline) {
      applyContinue();
      return;
    }
    const { attemptId } = useGameSessionStore.getState();
    if (attemptId === null) {
      onError("errors.generic");
      return;
    }
    mutate({ attemptId, idempotencyKey: uuidv7() });
  };

  return { price: CONTINUE_GEM_PRICE, canAfford: shortBy === 0, isPending, handlePress };
};
