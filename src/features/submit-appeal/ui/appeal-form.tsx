import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { ErrorMessageKey } from "@shared/api";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";
import { TextField } from "@shared/ui/text-field";

import { APPEAL_MAX_LENGTH, appealSchema } from "../model/appeal-schema";
import type { AppealSchema } from "../model/appeal-schema";
import { useSubmitAppeal } from "../model/use-submit-appeal";

import { styles } from "./appeal-sheet-styles";

interface IAppealForm {
  onSent: () => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

const DEFAULTS: AppealSchema = { message: "" };

const AppealForm = ({ onSent, onError }: IAppealForm) => {
  const { t } = useTranslation();
  const { control, handleSubmit, formState } = useForm<AppealSchema>({
    resolver: zodResolver(appealSchema),
    defaultValues: DEFAULTS,
    mode: "onChange",
  });
  const appeal = useSubmitAppeal({ onSent, onError });

  return (
    <View style={styles.sheet}>
      <Text variant="title.m" accessibilityRole="header">
        {t("system.banned.appeal")}
      </Text>
      <Controller
        control={control}
        name="message"
        render={({ field }) => (
          <TextField
            testID="appeal-message"
            label={t("system.appeal.field")}
            counter={`${field.value.length} / ${APPEAL_MAX_LENGTH}`}
            maxLength={APPEAL_MAX_LENGTH}
            multiline
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      <Button
        testID="appeal-send"
        label={t("system.appeal.send")}
        variant="primary"
        size="l"
        isDisabled={!formState.isValid || appeal.isPending}
        onPress={handleSubmit(({ message }) => appeal.submit(message))}
      />
    </View>
  );
};

export default AppealForm;
