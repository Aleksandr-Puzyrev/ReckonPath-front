import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { ErrorMessageKey } from "@shared/api";
import { formatDuration } from "@shared/lib";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";
import { TextField } from "@shared/ui/text-field";

import { EMAIL_CODE_LENGTH, emailCodeSchema } from "../model/email-code-schema";
import type { EmailCodeSchema } from "../model/email-code-schema";
import { fieldErrorKey } from "../model/field-error-key";
import { useEmailCode } from "../model/use-email-code";

import FormHeader from "./form-header";
import { styles } from "./email-code-styles";

interface IEmailCode {
  email: string;
  resendAfter: number;
  onBack: () => void;
  onConfirmed: () => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

const DEFAULTS: EmailCodeSchema = { code: "" };

const EmailCode = ({ email, resendAfter, onBack, onConfirmed, onError }: IEmailCode) => {
  const { t } = useTranslation();
  const { control, handleSubmit, setError } = useForm<EmailCodeSchema>({
    resolver: zodResolver(emailCodeSchema),
    defaultValues: DEFAULTS,
  });
  const emailCode = useEmailCode({
    email,
    resendAfter,
    onConfirmed,
    onCodeError: (messageKey) => setError("code", { message: messageKey }),
    onError,
  });
  const errorText = (message?: string) => {
    const key = fieldErrorKey(message);
    return key === undefined ? undefined : t(key);
  };
  const canResend = emailCode.resendInMs === 0;

  return (
    <View style={styles.form}>
      <FormHeader
        eyebrow={t("account.signUp.eyebrow")}
        title={t("account.code.title")}
        onBack={onBack}
      />
      <Text variant="body.m" style={styles.body}>
        {t("account.code.body", { email })}
      </Text>
      <Controller
        control={control}
        name="code"
        render={({ field, fieldState }) => (
          <TextField
            testID="email-code"
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
      <Button
        testID="email-code-submit"
        label={t("account.code.submit")}
        onPress={handleSubmit(emailCode.confirm)}
        variant="primary"
        size="l"
        isDisabled={emailCode.isPending}
      />
      <Button
        testID="email-code-resend"
        label={
          canResend
            ? t("account.code.resend")
            : t("account.code.resendIn", { time: formatDuration(emailCode.resendInMs) })
        }
        onPress={emailCode.resend}
        variant="ghost"
        size="l"
        isDisabled={!canResend || emailCode.isPending}
      />
    </View>
  );
};

export default EmailCode;
