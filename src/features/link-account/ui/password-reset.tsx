import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { ErrorMessageKey } from "@shared/api";
import { Text } from "@shared/ui/text";

import { useForgotPassword } from "../model/use-forgot-password";

import ForgotEmailForm from "./forgot-email-form";
import FormHeader from "./form-header";
import ResetPasswordForm from "./reset-password-form";
import { styles } from "./email-code-styles";

interface IPasswordReset {
  initialEmail: string;
  onBack: () => void;
  onReset: (email: string) => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

interface SentCode {
  email: string;
  resendAfter: number;
}

const PasswordReset = ({ initialEmail, onBack, onReset, onError }: IPasswordReset) => {
  const { t } = useTranslation();
  const [sent, setSent] = useState<SentCode | null>(null);
  const forgot = useForgotPassword(
    (email, resendAfter) => setSent({ email, resendAfter }),
    onError,
  );

  return (
    <View style={styles.form}>
      <FormHeader
        eyebrow={t("account.forgot.eyebrow")}
        title={t("account.forgot.title")}
        onBack={onBack}
      />
      <Text variant="body.m" style={styles.body}>
        {sent === null
          ? t("account.forgot.emailBody")
          : t("account.forgot.codeBody", { email: sent.email })}
      </Text>
      {sent === null ? (
        <ForgotEmailForm
          initialEmail={initialEmail}
          isPending={forgot.isPending}
          onSend={forgot.send}
        />
      ) : (
        <ResetPasswordForm
          email={sent.email}
          resendAfter={sent.resendAfter}
          onReset={onReset}
          onError={onError}
        />
      )}
    </View>
  );
};

export default PasswordReset;
