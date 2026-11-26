import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  meQueryOptions,
  updateNicknameMutationOptions,
  useNicknameCheck,
  walletKeys,
} from "@entities/wallet";
import type { Me } from "@entities/wallet";
import { errorMessageKey, isApiError, isInsufficientFunds } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";
import { HAS_BACKEND } from "@shared/config";
import { useDebouncedValue } from "@shared/lib";

import { nicknameNoteOf } from "./nickname-note";
import { nicknameSchema } from "./nickname-schema";
import type { NicknameSchema } from "./nickname-schema";

const CHECK_DEBOUNCE_MS = 400;
const NICKNAME_MESSAGE_KEYS = [
  "nick.short",
  "nick.invalid",
  "nick.taken",
  "nick.forbidden",
] as const;

type NicknameMessageKey = (typeof NICKNAME_MESSAGE_KEYS)[number] | "nick.ok";

interface ChangeNicknameCallbacks {
  onChanged: () => void;
  onShortOfEmeralds: (need: number) => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

const needOf = (details: Record<string, unknown>, fallback: number) =>
  typeof details.need === "number" ? details.need : fallback;

// The form keeps messages as plain strings; one it does not know reads as invalid characters (форма хранит сообщения строками; незнакомое читается как недопустимые символы).
const messageKeyOf = (message: string) =>
  NICKNAME_MESSAGE_KEYS.find((key) => key === message) ?? "nick.invalid";

const statusKeyOf = (error: string | undefined, isChanged: boolean): NicknameMessageKey | null => {
  if (error !== undefined) return messageKeyOf(error);
  return isChanged ? "nick.ok" : null;
};

export const useChangeNickname = (
  me: Me,
  { onChanged, onShortOfEmeralds, onError }: ChangeNicknameCallbacks,
) => {
  const queryClient = useQueryClient();
  const [openedAt] = useState(Date.now);
  const { control, handleSubmit, setError, formState } = useForm<NicknameSchema>({
    resolver: zodResolver(nicknameSchema),
    defaultValues: { nickname: me.nickname },
    mode: "onChange",
  });
  const nickname = useWatch({ control, name: "nickname" });
  const { mutate, isPending } = useMutation({
    ...updateNicknameMutationOptions(),
    onSuccess: (updated) => {
      queryClient.setQueryData(meQueryOptions().queryKey, updated);
      void queryClient.invalidateQueries({ queryKey: walletKeys.wallet() });
      onChanged();
    },
    onError: (error) => {
      const code = isApiError(error) ? error.code : null;
      if (code === "nick_taken") {
        setError("nickname", { message: "nick.taken" });
        return;
      }
      if (code === "validation_failed") {
        setError("nickname", { message: "nick.invalid" });
        return;
      }
      if (code === "nick_change_cooldown") {
        void queryClient.invalidateQueries({ queryKey: meQueryOptions().queryKey, exact: true });
        return;
      }
      if (isApiError(error) && isInsufficientFunds(code)) {
        onShortOfEmeralds(needOf(error.details, me.nicknameChange.price));
        return;
      }
      onError(errorMessageKey(error));
    },
  });

  const note = nicknameNoteOf(me.nicknameChange, openedAt);
  const error = formState.errors.nickname?.message;
  const isChanged = nickname.trim() !== me.nickname;

  const candidate = nickname.trim();
  const debounced = useDebouncedValue(candidate, CHECK_DEBOUNCE_MS);
  const check = useNicknameCheck(
    debounced,
    isChanged && debounced === candidate && nicknameSchema.safeParse({ nickname }).success,
  );
  const availability = candidate === debounced ? check.data : undefined;
  const unavailable = availability?.available === false;
  const serverStatus = availability?.reason ? (`nick.${availability.reason}` as const) : undefined;

  return {
    control,
    note,
    statusKey: statusKeyOf(
      error ?? serverStatus,
      isChanged && (!HAS_BACKEND || availability?.available === true),
    ),
    canSave:
      isChanged && error === undefined && !unavailable && note.kind !== "cooldown" && !isPending,
    save: handleSubmit(({ nickname: next }) => mutate(next)),
  };
};
