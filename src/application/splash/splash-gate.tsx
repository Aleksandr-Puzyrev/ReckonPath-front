import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Text } from "@shared/ui/text";

import SonarSplash from "./sonar-splash";
import { styles } from "./splash-styles";
import { useSplashState } from "./use-splash-state";

const SplashGate = () => {
  const { t } = useTranslation();
  const { isVisible, isUpdating } = useSplashState();

  if (isVisible) return <SonarSplash />;
  if (!isUpdating) return null;
  return (
    <View style={styles.banner} testID="splash-updating" accessibilityLiveRegion="polite">
      <Text variant="body.s" style={styles.bannerText}>
        {t("common.updating")}
      </Text>
    </View>
  );
};

export default SplashGate;
