import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { styles } from "./arena-onboarding-styles";

interface IOnboardingStatus {
  isFailed: boolean;
  onRetry: () => void;
  onLeave: () => void;
}

const OnboardingStatus = ({ isFailed, onRetry, onLeave }: IOnboardingStatus) => {
  const { t } = useTranslation();

  if (!isFailed) {
    return (
      <View style={styles.card} testID="onboarding-skeleton" accessibilityElementsHidden>
        <View style={styles.demo} />
      </View>
    );
  }
  return (
    <View style={styles.card}>
      <Text variant="body.m" style={styles.secondary}>
        {t("errors.generic")}
      </Text>
      <Button testID="onboarding-retry" label={t("common.retry")} onPress={onRetry} />
      <Button label={t("common.back")} variant="secondary" onPress={onLeave} />
    </View>
  );
};

export default OnboardingStatus;
