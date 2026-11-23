import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";

import { invalidateFriendsLeaderboard } from "@entities/daily";
import { friendsQueryOptions, invalidateFriends, inviteQueryOptions } from "@entities/friend";
import { invalidatePlayers } from "@entities/player";
import { errorMessageKey } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

import { redeemInviteMutationOptions } from "../api/redeem-invite-mutation";

import { inviteCodeSchema } from "./invite-code-schema";
import type { InviteCodeSchema } from "./invite-code-schema";

interface RedeemCallbacks {
  onRedeemed: (name: string | null) => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

// The redeem returns no data: the inviter's id comes with a fresh invite and the name with a fresh friends list (ввод кода не возвращает данных: id пригласившего приходит со свежим приглашением, а имя — со свежим списком друзей).
export const useRedeemInvite = ({ onRedeemed, onError }: RedeemCallbacks) => {
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset } = useForm<InviteCodeSchema>({
    resolver: zodResolver(inviteCodeSchema),
    defaultValues: { code: "" },
    mode: "onChange",
  });
  const code = useWatch({ control, name: "code" });

  // The code is accepted already, so a failed re-read only costs the name, never an error (код уже принят, поэтому неудачное перечитывание стоит только имени, но не ошибки).
  const findInviterName = async () => {
    try {
      await Promise.all([
        invalidateFriends(queryClient),
        invalidateFriendsLeaderboard(queryClient),
        invalidatePlayers(queryClient),
      ]);
      const invite = await queryClient.fetchQuery(inviteQueryOptions());
      const { friends } = await queryClient.fetchQuery(friendsQueryOptions());
      return friends.find(({ id }) => id === invite.invitedBy)?.name ?? null;
    } catch {
      return null;
    }
  };

  const { mutate, isPending } = useMutation({
    ...redeemInviteMutationOptions(),
    onSuccess: async () => {
      reset();
      const name = await findInviterName();
      onRedeemed(name);
    },
    onError: (error) => onError(errorMessageKey(error)),
  });

  return {
    control,
    isPending,
    canSubmit: code.trim().length > 0 && !isPending,
    submit: handleSubmit(({ code: value }) => mutate(value)),
  };
};
