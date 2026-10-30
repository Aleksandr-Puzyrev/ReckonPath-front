import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { ErrorMessageKey } from "@shared/api";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";
import { TextField } from "@shared/ui/text-field";

import { passwordConfirmSchema } from "../model/password-confirm-schema";
import type { PasswordConfirmSchema } from "../model/password-confirm-schema";
import { useDeleteAccount } from "../model/use-delete-account";

import { styles } from "./delete-account-styles";

interface IPasswordConfirmForm {
  onDeleted: (purgeAfter: string) => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

const DEFAULTS: PasswordConfirmSchema = { password: "" };
const WRONG_PASSWORD_KEY = "errors.invalid_credentials";

const PasswordConfirmForm = ({ onDeleted, onError }: IPasswordConfirmForm) => {
  const { t } = useTranslation();
  const { control, handleSubmit, formState, setError } = useForm<PasswordConfirmSchema>({
    resolver: zodResolver(passwordConfirmSchema),
    defaultValues: DEFAULTS,
    mode: "onChange",
  });
  const account = useDeleteAccount({
    onDeleted,
    onWrongPassword: () => setError("password", { message: WRONG_PASSWORD_KEY }),
    onError,
  });

  return (
    <View style={styles.sheet}>
      <Text variant="title.m" accessibilityRole="header">
        {t("settings.delete.title")}
      </Text>
      <Text variant="body.m" style={styles.secondary}>
        {t("settings.delete.passwordHint")}
      </Text>
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <TextField
            testID="delete-password"
            label={t("settings.delete.passwordLabel")}
            autoComplete="current-password"
            secureToggle={{ show: t("account.showPassword"), hide: t("account.hidePassword") }}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={
              fieldState.error?.message === WRONG_PASSWORD_KEY ? t(WRONG_PASSWORD_KEY) : undefined
            }
          />
        )}
      />
      <Button
        testID="delete-forever"
        label={t("settings.delete.forever").toLocaleUpperCase()}
        variant="danger"
        size="l"
        isDisabled={!formState.isValid || account.isPending}
        onPress={handleSubmit(({ password }) => account.remove(password))}
      />
    </View>
  );
};

export default PasswordConfirmForm;
