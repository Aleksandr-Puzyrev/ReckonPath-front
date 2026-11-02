import { useMutation } from "@tanstack/react-query";

import { errorMessageKey, isApiError } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

import { changeEmailMutationOptions } from "../api/change-email-mutation";
import { confirmEmailMutationOptions } from "../api/confirm-email-mutation";

import type { ChangeEmailSchema } from "./change-email-schema";
import type { EmailCodeSchema } from "./email-code-schema";
import { useResendCountdown } from "./use-resend-countdown";

const CODE_ERRORS: readonly unknown[] = ["invalid_code", "too_many_attempts"];

interface ConfirmEmailOptions {
  request: ChangeEmailSchema;
  resendAfter: number;
  onConfirmed: () => void;
  onCodeError: (messageKey: ErrorMessageKey) => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

// The password stays in memory for the resend only while this step is on the screen (пароль хранится в памяти для повторной отправки только пока этот шаг на экране).
export const useConfirmEmail = ({
  request,
  resendAfter,
  onConfirmed,
  onCodeError,
  onError,
}: ConfirmEmailOptions) => {
  const countdown = useResendCountdown(resendAfter);

  const confirm = useMutation({
    ...confirmEmailMutationOptions(),
    onSuccess: onConfirmed,
    onError: (error) => {
      const isCodeError = isApiError(error) && CODE_ERRORS.includes(error.code);
      (isCodeError ? onCodeError : onError)(errorMessageKey(error));
    },
  });

  const resend = useMutation({
    ...changeEmailMutationOptions(),
    onSuccess: ({ resendAfter: next }) => countdown.restart(next),
    onError: (error) => onError(errorMessageKey(error)),
  });

  return {
    confirm: ({ code }: EmailCodeSchema) => confirm.mutate(code),
    resend: () => resend.mutate(request),
    resendInMs: countdown.resendInMs,
    isPending: confirm.isPending || resend.isPending,
  };
};
