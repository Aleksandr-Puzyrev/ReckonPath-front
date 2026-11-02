import { useMutation } from "@tanstack/react-query";

import { errorMessageKey, isApiError } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

import { forgotPasswordMutationOptions } from "../api/forgot-password-mutation";
import { resetPasswordMutationOptions } from "../api/reset-password-mutation";

import type { ResetPasswordSchema } from "./reset-password-schema";
import { useResendCountdown } from "./use-resend-countdown";

const CODE_ERRORS: readonly unknown[] = ["invalid_code", "too_many_attempts"];

interface PasswordResetOptions {
  email: string;
  resendAfter: number;
  onReset: (email: string) => void;
  onCodeError: (messageKey: ErrorMessageKey) => void;
  onPasswordRejected: () => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

export const usePasswordReset = ({
  email,
  resendAfter,
  onReset,
  onCodeError,
  onPasswordRejected,
  onError,
}: PasswordResetOptions) => {
  const countdown = useResendCountdown(resendAfter);

  const resend = useMutation({
    ...forgotPasswordMutationOptions(),
    onSuccess: ({ resendAfter: next }) => countdown.restart(next),
    onError: (error) => onError(errorMessageKey(error)),
  });

  const reset = useMutation({
    ...resetPasswordMutationOptions(),
    onSuccess: () => onReset(email),
    onError: (error) => {
      const code = isApiError(error) ? error.code : null;
      if (CODE_ERRORS.includes(code)) {
        onCodeError(errorMessageKey(error));
        return;
      }
      if (code === "validation_failed") {
        onPasswordRejected();
        return;
      }
      onError(errorMessageKey(error));
    },
  });

  return {
    save: ({ code, password }: ResetPasswordSchema) => reset.mutate({ email, code, password }),
    resend: () => resend.mutate(email),
    resendInMs: countdown.resendInMs,
    isPending: reset.isPending || resend.isPending,
  };
};
