import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uuidv7 } from "uuidv7";

import type { AdMessageKey } from "@entities/ad";
import { campaignGameKey, continueCampaignGameMutationOptions, freshGameOf } from "@entities/level";
import type { CampaignGame } from "@entities/level";
import { useWalletQuery, walletKeys } from "@entities/wallet";
import { errorMessageKey, isApiError, isInsufficientFunds } from "@shared/api";
import { haptic } from "@shared/haptics";

export interface ContinueCallbacks {
  onContinued: () => void;
  onShortOfEmeralds: (need: number) => void;
  onError: (messageKey: AdMessageKey) => void;
}

const needOf = (details: Record<string, unknown>, fallback: number) =>
  typeof details.need === "number" ? details.need : fallback;

// The server charges the gems and gives the moves; the client only shows its answer (сервер списывает изумруды и даёт ходы, клиент только показывает его ответ).
export const useContinueCampaignGame = (
  game: CampaignGame,
  { onContinued, onShortOfEmeralds, onError }: ContinueCallbacks,
) => {
  const queryClient = useQueryClient();
  const { data: wallet } = useWalletQuery();
  const price = game.result?.continueCost ?? 0;
  const shortBy = Math.max(0, price - (wallet?.emeralds ?? 0));

  const { mutate, isPending } = useMutation({
    ...continueCampaignGameMutationOptions(),
    networkMode: "always",
    onSuccess: (next) => {
      queryClient.setQueryData(campaignGameKey(next.id), next);
      void queryClient.invalidateQueries({ queryKey: walletKeys.wallet() });
      haptic("success");
      onContinued();
    },
    onError: (error) => {
      const fresh = freshGameOf<CampaignGame>(error);
      if (fresh !== null) {
        queryClient.setQueryData(campaignGameKey(fresh.id), fresh);
        return;
      }
      if (isApiError(error) && isInsufficientFunds(error.code)) {
        onShortOfEmeralds(needOf(error.details, shortBy));
        return;
      }
      onError(errorMessageKey(error));
    },
  });

  const handlePress = () => {
    if (wallet !== undefined && shortBy > 0) {
      onShortOfEmeralds(shortBy);
      return;
    }
    mutate({ id: game.id, seq: game.seq, idempotencyKey: uuidv7() });
  };

  return { price, canAfford: shortBy === 0, isPending, handlePress };
};
