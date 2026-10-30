import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { EmailCode } from "@features/link-account";
import type { ErrorMessageKey } from "@shared/api";
import { Screen } from "@shared/ui/screen";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";

import { styles } from "./account-screen-styles";

const EmailCodeScreen = () => {
  const { t } = useTranslation();
  const { email = "", resendAfter = "0" } = useLocalSearchParams<{
    email: string;
    resendAfter: string;
  }>();
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showError = (messageKey: ErrorMessageKey) =>
    setToast((current) => ({ id: (current?.id ?? 0) + 1, text: t(messageKey) }));

  return (
    <Screen>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <EmailCode
          email={email}
          resendAfter={Number(resendAfter)}
          onBack={() => router.back()}
          onConfirmed={() => router.dismissAll()}
          onError={showError}
        />
      </KeyboardAwareScrollView>
      <Toast message={toast} onHide={() => setToast(null)} />
    </Screen>
  );
};

export default EmailCodeScreen;
