import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { ErrorMessageKey } from "@shared/api";
import { Button } from "@shared/ui/button";
import { TextField } from "@shared/ui/text-field";

import { changePasswordSchema } from "../model/change-password-schema";
import type { ChangePasswordSchema } from "../model/change-password-schema";
import { fieldErrorKey } from "../model/field-error-key";
import { useChangePassword } from "../model/use-change-password";

import FormHeader from "./form-header";
import PasswordStrengthBar from "./password-strength-bar";
import { styles } from "./sign-in-styles";

interface IChangePassword {
  onBack: () => void;
  onChanged: () => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

const DEFAULTS: ChangePasswordSchema = { currentPassword: "", newPassword: "" };

const ChangePassword = ({ onBack, onChanged, onError }: IChangePassword) => {
  const { t } = useTranslation();
  const { control, handleSubmit, setError } = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: DEFAULTS,
  });
  const change = useChangePassword({
    onChanged,
    onFieldError: (field, messageKey) => setError(field, { message: messageKey }),
    onError,
  });
  const secureToggle = { show: t("account.showPassword"), hide: t("account.hidePassword") };
  const errorText = (message?: string) => {
    const key = fieldErrorKey(message);
    return key === undefined ? undefined : t(key);
  };

  return (
    <View style={styles.form}>
      <FormHeader
        eyebrow={t("account.change.eyebrow")}
        title={t("account.change.passwordTitle")}
        onBack={onBack}
      />
      <Controller
        control={control}
        name="currentPassword"
        render={({ field, fieldState }) => (
          <TextField
            testID="change-current-password"
            label={t("account.change.currentPassword")}
            autoComplete="current-password"
            secureToggle={secureToggle}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errorText(fieldState.error?.message)}
          />
        )}
      />
      <Controller
        control={control}
        name="newPassword"
        render={({ field, fieldState }) => (
          <TextField
            testID="change-new-password"
            label={t("account.forgot.newPassword")}
            autoComplete="new-password"
            secureToggle={secureToggle}
            hint={<PasswordStrengthBar password={field.value} />}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errorText(fieldState.error?.message)}
          />
        )}
      />
      <Button
        testID="change-password-save"
        label={t("account.forgot.save")}
        onPress={handleSubmit(change.save)}
        variant="primary"
        size="l"
        isDisabled={change.isPending}
      />
    </View>
  );
};

export default ChangePassword;
