import { useMutation } from "@tanstack/react-query";

import { errorMessageKey, isApiError } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

import { changePasswordMutationOptions } from "../api/change-password-mutation";

import type { ChangePasswordSchema } from "./change-password-schema";
import type { FieldErrorKey } from "./field-error-key";

interface ChangePasswordCallbacks {
  onChanged: () => void;
  onFieldError: (field: keyof ChangePasswordSchema, messageKey: FieldErrorKey) => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

export const useChangePassword = ({
  onChanged,
  onFieldError,
  onError,
}: ChangePasswordCallbacks) => {
  const { mutate, isPending } = useMutation({
    ...changePasswordMutationOptions(),
    onSuccess: onChanged,
    onError: (error) => {
      const code = isApiError(error) ? error.code : null;
      if (code === "wrong_password") {
        onFieldError("currentPassword", "errors.wrong_password");
        return;
      }
      if (code === "validation_failed") {
        onFieldError("newPassword", "account.errors.passwordRejected");
        return;
      }
      onError(errorMessageKey(error));
    },
  });

  return { save: (values: ChangePasswordSchema) => mutate(values), isPending };
};
