import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { ErrorMessageKey } from "@shared/api";
import { Button } from "@shared/ui/button";
import { Sheet } from "@shared/ui/sheet";
import { Text } from "@shared/ui/text";

import { styles } from "./delete-account-styles";
import PasswordConfirmForm from "./password-confirm-form";

interface IDeleteAccountSheet {
  isOpen: boolean;
  summary: ReactNode;
  onDeleted: (purgeAfter: string) => void;
  onError: (messageKey: ErrorMessageKey) => void;
  onClose: () => void;
}

const DeleteAccountSheet = ({
  isOpen,
  summary,
  onDeleted,
  onError,
  onClose,
}: IDeleteAccountSheet) => {
  const { t } = useTranslation();
  const [isConfirming, setIsConfirming] = useState(false);
  const handleClose = () => {
    setIsConfirming(false);
    onClose();
  };

  return (
    <Sheet isOpen={isOpen} onDismiss={handleClose}>
      {isConfirming ? (
        <PasswordConfirmForm
          onDeleted={(purgeAfter) => {
            setIsConfirming(false);
            onDeleted(purgeAfter);
          }}
          onError={onError}
        />
      ) : (
        <View style={styles.sheet}>
          <Text variant="title.m" accessibilityRole="header">
            {t("settings.delete.title")}
          </Text>
          <Text variant="eyebrow" style={styles.eyebrow}>
            {t("settings.delete.what")}
          </Text>
          {summary}
          <Text variant="body.s" style={styles.secondary}>
            {t("settings.delete.noRestore")}
          </Text>
          <Button
            testID="delete-continue"
            label={t("settings.delete.continue").toLocaleUpperCase()}
            variant="danger"
            size="l"
            onPress={() => setIsConfirming(true)}
          />
          <Button label={t("settings.delete.cancel")} variant="ghost" onPress={handleClose} />
        </View>
      )}
    </Sheet>
  );
};

export default DeleteAccountSheet;
