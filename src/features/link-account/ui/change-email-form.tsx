import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type { ErrorMessageKey } from "@shared/api";
import { Button } from "@shared/ui/button";
import { TextField } from "@shared/ui/text-field";

import { changeEmailSchema } from "../model/change-email-schema";
import type { ChangeEmailSchema } from "../model/change-email-schema";
import { fieldErrorKey } from "../model/field-error-key";
import { useChangeEmail } from "../model/use-change-email";

interface IChangeEmailForm {
  onSent: (request: ChangeEmailSchema, resendAfter: number) => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

const DEFAULTS: ChangeEmailSchema = { email: "", password: "" };

const ChangeEmailForm = ({ onSent, onError }: IChangeEmailForm) => {
  const { t } = useTranslation();
  const { control, handleSubmit, setError } = useForm<ChangeEmailSchema>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: DEFAULTS,
  });
  const change = useChangeEmail({
    onSent,
    onFieldError: (field, messageKey) => setError(field, { message: messageKey }),
    onError,
  });
  const errorText = (message?: string) => {
    const key = fieldErrorKey(message);
    return key === undefined ? undefined : t(key);
  };

  return (
    <>
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <TextField
            testID="change-email"
            label={t("account.change.newEmail")}
            keyboardType="email-address"
            autoComplete="email"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errorText(fieldState.error?.message)}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <TextField
            testID="change-email-password"
            label={t("account.change.currentPassword")}
            autoComplete="current-password"
            secureToggle={{ show: t("account.showPassword"), hide: t("account.hidePassword") }}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errorText(fieldState.error?.message)}
          />
        )}
      />
      <Button
        testID="change-email-send"
        label={t("account.forgot.send")}
        onPress={handleSubmit(change.send)}
        variant="primary"
        size="l"
        isDisabled={change.isPending}
      />
    </>
  );
};

export default ChangeEmailForm;
