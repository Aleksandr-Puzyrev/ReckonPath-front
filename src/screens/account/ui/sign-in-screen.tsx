import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { SignIn } from "@features/link-account";
import type { ErrorMessageKey } from "@shared/api";
import { Screen } from "@shared/ui/screen";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";

import { styles } from "./account-screen-styles";

const SignInScreen = () => {
  const { t } = useTranslation();
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showError = (messageKey: ErrorMessageKey) =>
    setToast((current) => ({ id: (current?.id ?? 0) + 1, text: t(messageKey) }));

  return (
    <Screen>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <SignIn
          onBack={() => router.back()}
          onSignedIn={() => router.dismissTo("/")}
          onSignUp={() => router.replace("/account/sign-up")}
          onError={showError}
        />
      </KeyboardAwareScrollView>
      <Toast message={toast} onHide={() => setToast(null)} />
    </Screen>
  );
};

export default SignInScreen;
