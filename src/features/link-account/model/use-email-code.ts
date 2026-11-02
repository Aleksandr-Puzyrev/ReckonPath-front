import { useMutation, useQueryClient } from "@tanstack/react-query";

import { errorMessageKey, isApiError } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

import { resendCodeMutationOptions } from "../api/resend-code-mutation";
import { verifyEmailMutationOptions } from "../api/verify-email-mutation";

import type { EmailCodeSchema } from "./email-code-schema";
import { useResendCountdown } from "./use-resend-countdown";

const CODE_ERRORS: readonly unknown[] = ["invalid_code", "too_many_attempts"];

interface EmailCodeOptions {
  email: string;
  resendAfter: number;
  onConfirmed: () => void;
  onCodeError: (messageKey: ErrorMessageKey) => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

export const useEmailCode = ({
  email,
  resendAfter,
  onConfirmed,
  onCodeError,
  onError,
}: EmailCodeOptions) => {
  const queryClient = useQueryClient();
  const countdown = useResendCountdown(resendAfter);

  const verify = useMutation({
    ...verifyEmailMutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      onConfirmed();
    },
    onError: (error) => {
      const report = isApiError(error) && CODE_ERRORS.includes(error.code) ? onCodeError : onError;
      report(errorMessageKey(error));
    },
  });

  const resend = useMutation({
    ...resendCodeMutationOptions(),
    onSuccess: ({ resendAfter: next }) => countdown.restart(next),
    onError: (error) => onError(errorMessageKey(error)),
  });

  return {
    confirm: ({ code }: EmailCodeSchema) => verify.mutate({ email, code }),
    resend: () => resend.mutate(email),
    resendInMs: countdown.resendInMs,
    isPending: verify.isPending || resend.isPending,
  };
};
