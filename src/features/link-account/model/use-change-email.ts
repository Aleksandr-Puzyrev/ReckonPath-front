import { useMutation } from "@tanstack/react-query";

import { errorMessageKey, isApiError } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

import { changeEmailMutationOptions } from "../api/change-email-mutation";

import type { ChangeEmailSchema } from "./change-email-schema";
import type { FieldErrorKey } from "./field-error-key";

interface ChangeEmailCallbacks {
  onSent: (request: ChangeEmailSchema, resendAfter: number) => void;
  onFieldError: (field: keyof ChangeEmailSchema, messageKey: FieldErrorKey) => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

const FIELD_ERRORS = {
  wrong_password: ["password", "errors.wrong_password"],
  email_taken: ["email", "errors.email_taken"],
  same_email: ["email", "errors.same_email"],
} as const satisfies Record<string, [keyof ChangeEmailSchema, FieldErrorKey]>;

const fieldErrorOf = (error: unknown) => {
  if (!isApiError(error)) return null;
  const entry = Object.entries(FIELD_ERRORS).find(([code]) => code === error.code);
  return entry === undefined ? null : entry[1];
};

export const useChangeEmail = ({ onSent, onFieldError, onError }: ChangeEmailCallbacks) => {
  const { mutate, isPending } = useMutation({
    ...changeEmailMutationOptions(),
    onSuccess: ({ resendAfter }, request) => onSent(request, resendAfter),
    onError: (error) => {
      const fieldError = fieldErrorOf(error);
      if (fieldError === null) {
        onError(errorMessageKey(error));
        return;
      }
      onFieldError(fieldError[0], fieldError[1]);
    },
  });

  return { send: (values: ChangeEmailSchema) => mutate(values), isPending };
};
