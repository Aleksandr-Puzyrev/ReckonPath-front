import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, { FadeOut, useReducedMotion } from "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";

import { Text } from "@shared/ui/text";

import emblem from "@assets/images/reckon-emblem.png";

import SonarRing from "./sonar-ring";
import { styles } from "./splash-styles";

// Three rings a third of a sweep apart (три кольца со сдвигом на треть оборота).
const RING_SHARES = [0, 1 / 3, 2 / 3] as const;

const SonarSplash = () => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const isReducedMotion = useReducedMotion();

  return (
    <Animated.View
      testID="splash"
      style={styles.splash}
      exiting={isReducedMotion ? undefined : FadeOut.duration(theme.motion.duration.slow)}
    >
      <View style={styles.stage}>
        {isReducedMotion
          ? null
          : RING_SHARES.map((share) => (
              <SonarRing key={share} delay={share * theme.motion.animation.radarTurn} />
            ))}
        <Image source={emblem} style={styles.emblem} accessibilityLabel={t("brand.emblem")} />
      </View>
      <View style={styles.brand}>
        <Text variant="display.m" style={styles.title}>
          {t("brand.first")}
          <Text variant="display.m" style={styles.accent}>
            {t("brand.second")}
          </Text>
        </Text>
        <Text variant="eyebrow" style={styles.tagline}>
          {t("brand.tagline")}
        </Text>
      </View>
    </Animated.View>
  );
};

export default SonarSplash;
