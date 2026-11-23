import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { SupportTopic } from "@entities/support";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";
import { TextField } from "@shared/ui/text-field";

import { SUPPORT_MESSAGE_MAX, supportSchema } from "../model/support-schema";
import type { SupportSchema } from "../model/support-schema";
import { SUPPORT_TEXTS } from "../model/support-texts";
import { useContactSupport } from "../model/use-contact-support";
import type { SupportCallbacks } from "../model/use-contact-support";

import { styles } from "./support-sheet-styles";

interface ISupportForm extends SupportCallbacks {
  topic: SupportTopic;
  title: string;
}

const DEFAULTS: SupportSchema = { message: "" };

const SupportForm = ({ topic, title, onSent, onError }: ISupportForm) => {
  const { t } = useTranslation();
  const { control, handleSubmit, formState } = useForm<SupportSchema>({
    resolver: zodResolver(supportSchema),
    defaultValues: DEFAULTS,
    mode: "onChange",
  });
  const support = useContactSupport(topic, { onSent, onError });

  return (
    <View style={styles.sheet}>
      <Text variant="title.m" accessibilityRole="header">
        {title}
      </Text>
      <Controller
        control={control}
        name="message"
        render={({ field }) => (
          <TextField
            testID="support-message"
            label={t(SUPPORT_TEXTS[topic].field)}
            counter={`${field.value.length} / ${SUPPORT_MESSAGE_MAX}`}
            maxLength={SUPPORT_MESSAGE_MAX}
            multiline
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      <Button
        testID="support-send"
        label={t("system.appeal.send")}
        variant="primary"
        size="l"
        isDisabled={!formState.isValid || support.isPending}
        onPress={handleSubmit(({ message }) => support.submit(message))}
      />
    </View>
  );
};

export default SupportForm;
