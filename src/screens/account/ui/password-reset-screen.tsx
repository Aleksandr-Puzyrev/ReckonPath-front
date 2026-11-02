import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { PasswordReset } from "@features/link-account";
import type { ErrorMessageKey } from "@shared/api";
import { Screen } from "@shared/ui/screen";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";

import { styles } from "./account-screen-styles";

const PasswordResetScreen = () => {
  const { t } = useTranslation();
  const { email = "" } = useLocalSearchParams<{ email?: string }>();
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showError = (messageKey: ErrorMessageKey) =>
    setToast((current) => ({ id: (current?.id ?? 0) + 1, text: t(messageKey) }));

  return (
    <Screen>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <PasswordReset
          initialEmail={email}
          onBack={() => router.back()}
          onReset={(resetFor) =>
            router.navigate({
              pathname: "/account/sign-in",
              params: { email: resetFor, reset: String(Date.now()) },
            })
          }
          onError={showError}
        />
      </KeyboardAwareScrollView>
      <Toast message={toast} onHide={() => setToast(null)} />
    </Screen>
  );
};

export default PasswordResetScreen;
