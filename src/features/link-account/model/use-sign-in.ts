import { useMutation, useQueryClient } from "@tanstack/react-query";

import { errorMessageKey, isApiError } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

import { loginMutationOptions } from "../api/login-mutation";
import { resendCodeMutationOptions } from "../api/resend-code-mutation";

import type { SignInSchema } from "./sign-in-schema";

export interface SignInCallbacks {
  onSignedIn: () => void;
  onWrongCredentials: (messageKey: ErrorMessageKey) => void;
  onNeedsCode: (email: string, resendAfter: number) => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

// The guest's progress stays on the device: the backend has no progress to load yet (прогресс гостя остаётся на устройстве: загрузить с сервера пока нечего).
export const useSignIn = ({
  onSignedIn,
  onWrongCredentials,
  onNeedsCode,
  onError,
}: SignInCallbacks) => {
  const queryClient = useQueryClient();
  const resend = useMutation({
    ...resendCodeMutationOptions(),
    onSuccess: ({ resendAfter }, email) => onNeedsCode(email, resendAfter),
    onError: (error) => onError(errorMessageKey(error)),
  });

  const login = useMutation({
    ...loginMutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      onSignedIn();
    },
    onError: (error, { email }) => {
      const code = isApiError(error) ? error.code : null;
      if (code === "invalid_credentials") {
        onWrongCredentials(errorMessageKey(error));
        return;
      }
      if (code === "email_not_verified") {
        resend.mutate(email);
        return;
      }
      onError(errorMessageKey(error));
    },
  });

  return {
    submit: ({ email, password }: SignInSchema) => login.mutate({ email, password }),
    isPending: login.isPending || resend.isPending,
  };
};
