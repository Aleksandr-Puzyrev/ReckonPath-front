import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { ErrorMessageKey } from "@shared/api";
import { Button } from "@shared/ui/button";
import { TextField } from "@shared/ui/text-field";

import { INVITE_CODE_MAX_LENGTH } from "../model/invite-code-schema";
import { useRedeemInvite } from "../model/use-redeem-invite";

import { styles } from "./invite-code-styles";

interface IRedeemInviteForm {
  isDisabled: boolean;
  onRedeemed: (name: string | null) => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

const RedeemInviteForm = ({ isDisabled, onRedeemed, onError }: IRedeemInviteForm) => {
  const { t } = useTranslation();
  const form = useRedeemInvite({ onRedeemed, onError });

  return (
    <View style={styles.form}>
      <Controller
        control={form.control}
        name="code"
        render={({ field }) => (
          <TextField
            testID="invite-redeem-input"
            label={t("friends.redeem")}
            maxLength={INVITE_CODE_MAX_LENGTH}
            isInSheet
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      <Button
        testID="invite-redeem"
        label={t("account.code.submit")}
        isDisabled={isDisabled || !form.canSubmit}
        onPress={() => void form.submit()}
      />
    </View>
  );
};

export default RedeemInviteForm;
