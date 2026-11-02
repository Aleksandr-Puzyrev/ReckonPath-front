import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { ErrorMessageKey } from "@shared/api";
import { Text } from "@shared/ui/text";

import type { ChangeEmailSchema } from "../model/change-email-schema";

import ChangeEmailForm from "./change-email-form";
import ConfirmEmailForm from "./confirm-email-form";
import FormHeader from "./form-header";
import { styles } from "./email-code-styles";

interface IChangeEmail {
  onBack: () => void;
  onChanged: () => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

interface SentCode {
  request: ChangeEmailSchema;
  resendAfter: number;
}

const ChangeEmail = ({ onBack, onChanged, onError }: IChangeEmail) => {
  const { t } = useTranslation();
  const [sent, setSent] = useState<SentCode | null>(null);

  return (
    <View style={styles.form}>
      <FormHeader
        eyebrow={t("account.change.eyebrow")}
        title={t("account.change.emailTitle")}
        onBack={onBack}
      />
      <Text variant="body.m" style={styles.body}>
        {sent === null
          ? t("account.change.emailBody")
          : t("account.change.codeBody", { email: sent.request.email })}
      </Text>
      {sent === null ? (
        <ChangeEmailForm
          onSent={(request, resendAfter) => setSent({ request, resendAfter })}
          onError={onError}
        />
      ) : (
        <ConfirmEmailForm
          request={sent.request}
          resendAfter={sent.resendAfter}
          onConfirmed={onChanged}
          onError={onError}
        />
      )}
    </View>
  );
};

export default ChangeEmail;
