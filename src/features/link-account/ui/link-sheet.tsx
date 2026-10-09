import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Button } from "@shared/ui/button";
import { Gradient } from "@shared/ui/gradient";
import { Sheet } from "@shared/ui/sheet";
import { Text } from "@shared/ui/text";

import ShieldIcon from "@assets/icons/account/shield.svg";
import CheckIcon from "@assets/icons/levels/check.svg";

import { styles } from "./link-sheet-styles";

interface ILinkSheet {
  isOpen: boolean;
  onSignUp: () => void;
  onSignIn: () => void;
  onLater: () => void;
}

const BENEFITS = ["phone", "friends", "devices"] as const;

const LinkSheet = ({ isOpen, onSignUp, onSignIn, onLater }: ILinkSheet) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const badge = theme.sizes.linkBadge;
  const iconSize = theme.sizes.icon.m;

  return (
    <Sheet isOpen={isOpen} onDismiss={onLater}>
      <View style={styles.badge}>
        <Gradient name="primary" radius={badge.radius} />
        <ShieldIcon width={badge.icon} height={badge.icon} color={theme.colors.text.onAccent} />
      </View>
      <Text variant="display.m" accessibilityRole="header" style={styles.title}>
        {t("profile.saveProgress")}
      </Text>
      <View style={styles.benefits}>
        {BENEFITS.map((benefit) => (
          <View key={benefit} style={styles.benefit}>
            <CheckIcon width={iconSize} height={iconSize} color={theme.colors.status.success} />
            <Text variant="body.m" style={styles.benefitText}>
              {t(`account.benefits.${benefit}`)}
            </Text>
          </View>
        ))}
      </View>
      <Button
        testID="link-sign-up"
        label={t("account.signUpAction")}
        onPress={onSignUp}
        variant="primary"
        size="l"
      />
      <Button testID="link-sign-in" label={t("account.signInAction")} onPress={onSignIn} size="l" />
      <Button label={t("account.later")} onPress={onLater} variant="ghost" />
    </Sheet>
  );
};

export default LinkSheet;
