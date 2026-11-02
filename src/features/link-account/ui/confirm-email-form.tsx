import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type { ErrorMessageKey } from "@shared/api";
import { formatDuration } from "@shared/lib";
import { Button } from "@shared/ui/button";
import { TextField } from "@shared/ui/text-field";

import type { ChangeEmailSchema } from "../model/change-email-schema";
import { EMAIL_CODE_LENGTH, emailCodeSchema } from "../model/email-code-schema";
import type { EmailCodeSchema } from "../model/email-code-schema";
import { fieldErrorKey } from "../model/field-error-key";
import { useConfirmEmail } from "../model/use-confirm-email";

interface IConfirmEmailForm {
  request: ChangeEmailSchema;
  resendAfter: number;
  onConfirmed: () => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

const DEFAULTS: EmailCodeSchema = { code: "" };

const ConfirmEmailForm = ({ request, resendAfter, onConfirmed, onError }: IConfirmEmailForm) => {
  const { t } = useTranslation();
  const { control, handleSubmit, setError } = useForm<EmailCodeSchema>({
    resolver: zodResolver(emailCodeSchema),
    defaultValues: DEFAULTS,
  });
  const confirm = useConfirmEmail({
    request,
    resendAfter,
    onConfirmed,
    onCodeError: (messageKey) => setError("code", { message: messageKey }),
    onError,
  });
  const canResend = confirm.resendInMs === 0;

  return (
    <>
      <Controller
        control={control}
        name="code"
        render={({ field, fieldState }) => {
          const key = fieldErrorKey(fieldState.error?.message);
          return (
            <TextField
              testID="change-email-code"
              label={t("account.code.label")}
              keyboardType="number-pad"
              autoComplete="one-time-code"
              maxLength={EMAIL_CODE_LENGTH}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={key === undefined ? undefined : t(key)}
            />
          );
        }}
      />
      <Button
        testID="change-email-confirm"
        label={t("account.code.submit")}
        onPress={handleSubmit(confirm.confirm)}
        variant="primary"
        size="l"
        isDisabled={confirm.isPending}
      />
      <Button
        testID="change-email-resend"
        label={
          canResend
            ? t("account.code.resend")
            : t("account.code.resendIn", { time: formatDuration(confirm.resendInMs) })
        }
        onPress={confirm.resend}
        variant="ghost"
        size="l"
        isDisabled={!canResend || confirm.isPending}
      />
    </>
  );
};

export default ConfirmEmailForm;
