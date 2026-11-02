import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@shared/ui/button";
import { TextField } from "@shared/ui/text-field";

import { fieldErrorKey } from "../model/field-error-key";
import { forgotEmailSchema } from "../model/forgot-email-schema";
import type { ForgotEmailSchema } from "../model/forgot-email-schema";

interface IForgotEmailForm {
  initialEmail: string;
  isPending: boolean;
  onSend: (email: string) => void;
}

const ForgotEmailForm = ({ initialEmail, isPending, onSend }: IForgotEmailForm) => {
  const { t } = useTranslation();
  const { control, handleSubmit } = useForm<ForgotEmailSchema>({
    resolver: zodResolver(forgotEmailSchema),
    defaultValues: { email: initialEmail },
  });

  return (
    <>
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => {
          const key = fieldErrorKey(fieldState.error?.message);
          return (
            <TextField
              testID="forgot-email"
              label={t("account.signUp.email")}
              keyboardType="email-address"
              autoComplete="email"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={key === undefined ? undefined : t(key)}
            />
          );
        }}
      />
      <Button
        testID="forgot-send"
        label={t("account.forgot.send")}
        onPress={handleSubmit(({ email }) => onSend(email))}
        variant="primary"
        size="l"
        isDisabled={isPending}
      />
    </>
  );
};

export default ForgotEmailForm;
