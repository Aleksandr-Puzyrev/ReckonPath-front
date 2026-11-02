import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type { ErrorMessageKey } from "@shared/api";
import { formatDuration } from "@shared/lib";
import { Button } from "@shared/ui/button";
import { TextField } from "@shared/ui/text-field";

import { EMAIL_CODE_LENGTH } from "../model/email-code-schema";
import { fieldErrorKey } from "../model/field-error-key";
import { resetPasswordSchema } from "../model/reset-password-schema";
import type { ResetPasswordSchema } from "../model/reset-password-schema";
import { usePasswordReset } from "../model/use-password-reset";

import PasswordStrengthBar from "./password-strength-bar";

interface IResetPasswordForm {
  email: string;
  resendAfter: number;
  onReset: (email: string) => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

const DEFAULTS: ResetPasswordSchema = { code: "", password: "" };

const ResetPasswordForm = ({ email, resendAfter, onReset, onError }: IResetPasswordForm) => {
  const { t } = useTranslation();
  const { control, handleSubmit, setError } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: DEFAULTS,
  });
  const reset = usePasswordReset({
    email,
    resendAfter,
    onReset,
    onCodeError: (messageKey) => setError("code", { message: messageKey }),
    onPasswordRejected: () => setError("password", { message: "account.errors.passwordRejected" }),
    onError,
  });
  const errorText = (message?: string) => {
    const key = fieldErrorKey(message);
    return key === undefined ? undefined : t(key);
  };
  const canResend = reset.resendInMs === 0;

  return (
    <>
      <Controller
        control={control}
        name="code"
        render={({ field, fieldState }) => (
          <TextField
            testID="forgot-code"
            label={t("account.code.label")}
            keyboardType="number-pad"
            autoComplete="one-time-code"
            maxLength={EMAIL_CODE_LENGTH}
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
            testID="forgot-password"
            label={t("account.forgot.newPassword")}
            autoComplete="new-password"
            secureToggle={{ show: t("account.showPassword"), hide: t("account.hidePassword") }}
            hint={<PasswordStrengthBar password={field.value} />}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errorText(fieldState.error?.message)}
          />
        )}
      />
      <Button
        testID="forgot-save"
        label={t("account.forgot.save")}
        onPress={handleSubmit(reset.save)}
        variant="primary"
        size="l"
        isDisabled={reset.isPending}
      />
      <Button
        testID="forgot-resend"
        label={
          canResend
            ? t("account.code.resend")
            : t("account.code.resendIn", { time: formatDuration(reset.resendInMs) })
        }
        onPress={reset.resend}
        variant="ghost"
        size="l"
        isDisabled={!canResend || reset.isPending}
      />
    </>
  );
};

export default ResetPasswordForm;
