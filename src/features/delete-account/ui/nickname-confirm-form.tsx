import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";
import { TextField } from "@shared/ui/text-field";

import { nicknameConfirmSchema } from "../model/nickname-confirm-schema";
import type { NicknameConfirmSchema } from "../model/nickname-confirm-schema";

import { styles } from "./delete-account-styles";

interface INicknameConfirmForm {
  nickname: string;
  isPending: boolean;
  onConfirm: (nickname: string) => void;
}

const DEFAULTS: NicknameConfirmSchema = { nickname: "" };

const NicknameConfirmForm = ({ nickname, isPending, onConfirm }: INicknameConfirmForm) => {
  const { t } = useTranslation();
  const { control, handleSubmit, formState } = useForm<NicknameConfirmSchema>({
    resolver: zodResolver(nicknameConfirmSchema(nickname)),
    defaultValues: DEFAULTS,
    mode: "onChange",
  });

  return (
    <View style={styles.sheet}>
      <Text variant="title.m" accessibilityRole="header">
        {t("settings.delete.confirmTitle")}
      </Text>
      <Text variant="body.m" style={styles.secondary}>
        {t("settings.delete.confirmBody", { nickname })}
      </Text>
      <Controller
        control={control}
        name="nickname"
        render={({ field, fieldState }) => (
          <TextField
            testID="delete-nickname"
            label={t("account.signUp.nickname")}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error === undefined ? undefined : t("settings.delete.mismatch")}
          />
        )}
      />
      <Button
        testID="delete-forever"
        label={t("settings.delete.forever").toLocaleUpperCase()}
        variant="danger"
        size="l"
        isDisabled={!formState.isValid || isPending}
        onPress={handleSubmit(() => onConfirm(nickname))}
      />
    </View>
  );
};

export default NicknameConfirmForm;
