import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import { useAcceptConsents } from "@features/manage-consents";
import { useSignOut } from "@features/sign-out";
import { openPrivacyPolicy } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";
import { Button } from "@shared/ui/button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";

import { styles } from "./consents-screen-styles";

const ConsentsScreen = () => {
  const { t } = useTranslation();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showError = (messageKey: ErrorMessageKey) =>
    setToast((current) => ({ id: (current?.id ?? 0) + 1, text: t(messageKey) }));
  const consents = useAcceptConsents(showError);
  const signOut = useSignOut({ onSignedOut: () => undefined, onError: showError });
  const isBusy = consents.isPending || signOut.isPending;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.texts}>
          <Text variant="display.l" accessibilityRole="header">
            {t("consents.title")}
          </Text>
          <Text variant="body.l" style={styles.body}>
            {t("consents.body")}
          </Text>
          <Text
            testID="consents-privacy"
            variant="title.s"
            accessibilityRole="link"
            style={styles.link}
            onPress={openPrivacyPolicy}
          >
            {t("settings.privacyPolicy")}
          </Text>
        </View>
        <View style={styles.actions}>
          <Button
            testID="consents-accept"
            label={t("consents.accept")}
            onPress={consents.accept}
            variant="primary"
            size="l"
            isDisabled={isBusy || !consents.canAccept}
          />
          <Button
            testID="consents-sign-out"
            label={t("settings.account.signOut")}
            onPress={signOut.signOut}
            variant="ghost"
            size="l"
            isDisabled={isBusy}
          />
        </View>
      </ScrollView>
      <Toast message={toast} onHide={() => setToast(null)} />
    </Screen>
  );
};

export default ConsentsScreen;
