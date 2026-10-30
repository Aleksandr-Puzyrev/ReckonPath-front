import { useTranslation } from "react-i18next";
import { Linking, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Button } from "@shared/ui/button";
import { Gradient } from "@shared/ui/gradient";
import { Sheet } from "@shared/ui/sheet";
import { Text } from "@shared/ui/text";

import UpdateIcon from "@assets/icons/system/update.svg";

import { styles } from "./soft-update-sheet-styles";

interface ISoftUpdateSheet {
  isOpen: boolean;
  version: string;
  storeUrl: string | null;
  onDismiss: () => void;
}

const SoftUpdateSheet = ({ isOpen, version, storeUrl, onDismiss }: ISoftUpdateSheet) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const badge = theme.sizes.softUpdateBadge;

  const handleUpdate = (url: string) => {
    onDismiss();
    Linking.openURL(url);
  };

  return (
    <Sheet isOpen={isOpen} onDismiss={onDismiss}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Gradient name="primary" radius={badge.radius} />
          <UpdateIcon width={badge.icon} height={badge.icon} color={theme.colors.text.onAccent} />
        </View>
        <Text variant="title.l" accessibilityRole="header" style={styles.title}>
          {t("system.update.softTitle", { version })}
        </Text>
      </View>
      <View style={styles.actions}>
        <View style={styles.later}>
          <Button label={t("system.update.later")} onPress={onDismiss} size="l" />
        </View>
        {storeUrl === null ? null : (
          <View style={styles.update}>
            <Button
              label={t("system.update.cta")}
              onPress={() => handleUpdate(storeUrl)}
              variant="primary"
              size="l"
            />
          </View>
        )}
      </View>
    </Sheet>
  );
};

export default SoftUpdateSheet;
