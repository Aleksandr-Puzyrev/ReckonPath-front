import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { errorMessageKey, isApiError } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

import { resendCodeMutationOptions } from "../api/resend-code-mutation";
import { verifyEmailMutationOptions } from "../api/verify-email-mutation";

import type { EmailCodeSchema } from "./email-code-schema";

const SECOND_MS = 1000;
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
  const [resendAt, setResendAt] = useState(() => Date.now() + resendAfter * SECOND_MS);
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), SECOND_MS);
    return () => clearInterval(timer);
  }, []);

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
    onSuccess: ({ resendAfter: next }) => setResendAt(Date.now() + next * SECOND_MS),
    onError: (error) => onError(errorMessageKey(error)),
  });

  return {
    confirm: ({ code }: EmailCodeSchema) => verify.mutate({ email, code }),
    resend: () => resend.mutate(email),
    resendInMs: Math.max(0, resendAt - now),
    isPending: verify.isPending || resend.isPending,
  };
};
