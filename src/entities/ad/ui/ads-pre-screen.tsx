import { useTranslation } from "react-i18next";
import { Modal, View } from "react-native";

import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { styles } from "./ads-pre-screen-styles";

interface IAdsPreScreen {
  isOpen: boolean;
  onContinue: () => void;
  onClosed: () => void;
}

const ignoreClose = () => undefined;

// Not dismissible: the system request must follow it (не закрывается: за ним должен идти системный запрос).
const AdsPreScreen = ({ isOpen, onContinue, onClosed }: IAdsPreScreen) => {
  const { t } = useTranslation();

  return (
    <Modal visible={isOpen} animationType="fade" onRequestClose={ignoreClose} onDismiss={onClosed}>
      <View style={styles.screen}>
        <View style={styles.texts}>
          <Text variant="display.m" accessibilityRole="header" style={styles.centered}>
            {t("ads.att.title")}
          </Text>
          <Text variant="body.m" style={[styles.centered, styles.body]}>
            {t("ads.att.body")}
          </Text>
        </View>
        <Button
          testID="ads-pre-screen-continue"
          label={t("ads.att.continue")}
          onPress={onContinue}
          variant="primary"
          size="l"
        />
      </View>
    </Modal>
  );
};

export default AdsPreScreen;
