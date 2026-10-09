import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Text } from "@shared/ui/text";

import { passwordScore, passwordStrength } from "../model/password-strength";

import { styles } from "./password-strength-bar-styles";

interface IPasswordStrengthBar {
  password: string;
}

const SEGMENTS = [1, 2, 3, 4] as const;

const PasswordStrengthBar = ({ password }: IPasswordStrengthBar) => {
  const { t } = useTranslation();
  const isEmpty = password.length === 0;
  const score = passwordScore(password);
  const strength = passwordStrength(password);
  styles.useVariants({ strength: isEmpty ? undefined : strength });

  return (
    <View style={styles.bar}>
      <View style={styles.segments}>
        {SEGMENTS.map((segment) => (
          <View
            key={segment}
            style={[styles.segment, score >= segment ? styles.segmentOn : null]}
          />
        ))}
      </View>
      <Text variant="caption" style={styles.label} accessibilityLiveRegion="polite">
        {isEmpty ? t("account.signUp.passwordHint") : t(`account.signUp.strength.${strength}`)}
      </Text>
    </View>
  );
};

export default PasswordStrengthBar;
