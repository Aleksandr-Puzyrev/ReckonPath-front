import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { NICKNAME_MAX_LENGTH } from "@entities/wallet";
import type { Me } from "@entities/wallet";
import type { ErrorMessageKey } from "@shared/api";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";
import { TextField } from "@shared/ui/text-field";

import { useChangeNickname } from "../model/use-change-nickname";

import NicknameNoteRow from "./nickname-note-row";
import { styles } from "./nickname-form-styles";

interface INicknameForm {
  me: Me;
  onChanged: () => void;
  onShortOfEmeralds: (need: number) => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

const NicknameForm = ({ me, onChanged, onShortOfEmeralds, onError }: INicknameForm) => {
  const { t } = useTranslation();
  const form = useChangeNickname(me, { onChanged, onShortOfEmeralds, onError });
  const isOk = form.statusKey === "nick.ok";

  return (
    <View style={styles.form}>
      <Controller
        control={form.control}
        name="nickname"
        render={({ field }) => (
          <TextField
            testID="nickname-input"
            label={t("nick.title")}
            counter={`${field.value.length} / ${NICKNAME_MAX_LENGTH}`}
            maxLength={NICKNAME_MAX_LENGTH}
            autoComplete="username-new"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={form.statusKey === null || isOk ? undefined : t(form.statusKey)}
            hint={
              <Text variant="body.s" style={isOk ? styles.ok : styles.hint}>
                {isOk ? t("nick.ok") : t("nick.rules")}
              </Text>
            }
          />
        )}
      />
      <NicknameNoteRow note={form.note} />
      <Button
        testID="nickname-save"
        label={t("nick.save")}
        size="l"
        isDisabled={!form.canSave}
        onPress={() => void form.save()}
      />
    </View>
  );
};

export default NicknameForm;
