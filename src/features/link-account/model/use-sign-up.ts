import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAccountStore } from "@entities/session";
import { walletKeys } from "@entities/wallet";
import { errorMessageKey, isApiError } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

import { registerMutationOptions } from "../api/register-mutation";

import type { SignUpSchema } from "./sign-up-schema";

type SignUpField = "nickname" | "email";

export interface SignUpCallbacks {
  onLinked: () => void;
  onFieldError: (field: SignUpField, messageKey: ErrorMessageKey) => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

const fieldOf = (error: unknown): SignUpField | null => {
  if (!isApiError(error)) return null;
  if (error.code === "NICK_TAKEN") return "nickname";
  if (error.code === "EMAIL_TAKEN") return "email";
  return null;
};

export const useSignUp = ({ onLinked, onFieldError, onError }: SignUpCallbacks) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    ...registerMutationOptions(),
    onSuccess: () => {
      useAccountStore.getState().markRegistered();
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      onLinked();
    },
    onError: (error) => {
      const field = fieldOf(error);
      if (field === null) {
        onError(errorMessageKey(error));
        return;
      }
      onFieldError(field, errorMessageKey(error));
    },
  });

  const submit = ({ nickname, email, password }: SignUpSchema) =>
    mutate({ nickname, email, password });

  return { submit, isPending };
};
