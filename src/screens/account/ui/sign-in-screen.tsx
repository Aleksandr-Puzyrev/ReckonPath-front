import { router, useLocalSearchParams } from "expo-router";
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
  const { email = "", reset } = useLocalSearchParams<{ email?: string; reset?: string }>();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [notice, setNotice] = useState<ToastMessage | null>(null);
  const [noticedReset, setNoticedReset] = useState<string | undefined>(undefined);

  // Each return from the password recovery brings a new moment of the reset, which raises its notice once (каждый возврат из восстановления пароля приносит новый момент сброса, и он один раз поднимает сообщение).
  if (reset !== noticedReset) {
    setNoticedReset(reset);
    setNotice(reset === undefined ? null : { id: Number(reset), text: t("account.forgot.done") });
  }

  const showError = (messageKey: ErrorMessageKey) =>
    setToast((current) => ({ id: (current?.id ?? 0) + 1, text: t(messageKey) }));

  return (
    <Screen>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <SignIn
          key={email}
          initialEmail={email}
          onBack={() => router.back()}
          onSignedIn={() => router.dismissTo("/")}
          onNeedsCode={(email, resendAfter) =>
            router.push({
              pathname: "/account/code",
              params: { email, resendAfter: String(resendAfter) },
            })
          }
          onForgot={(typed) =>
            router.push({ pathname: "/account/forgot", params: { email: typed } })
          }
          onSignUp={() => router.replace("/account/sign-up")}
          onError={showError}
        />
      </KeyboardAwareScrollView>
      <Toast
        message={toast ?? notice}
        onHide={() => (toast === null ? setNotice(null) : setToast(null))}
      />
    </Screen>
  );
};

export default SignInScreen;
