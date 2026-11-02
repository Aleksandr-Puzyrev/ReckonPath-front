import { useMutation } from "@tanstack/react-query";

import { errorMessageKey } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

import { forgotPasswordMutationOptions } from "../api/forgot-password-mutation";

export const useForgotPassword = (
  onSent: (email: string, resendAfter: number) => void,
  onError: (messageKey: ErrorMessageKey) => void,
) => {
  const { mutate, isPending } = useMutation({
    ...forgotPasswordMutationOptions(),
    onSuccess: ({ resendAfter }, email) => onSent(email, resendAfter),
    onError: (error) => onError(errorMessageKey(error)),
  });

  return { send: mutate, isPending };
};
