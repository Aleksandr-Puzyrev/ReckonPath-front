import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, { FadeInLeft, useReducedMotion } from "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";

import { SEASON_RESET_THRESHOLD } from "@reckon-path/engine";

import { formatNumber } from "@shared/lib";
import { Text } from "@shared/ui/text";

import ChevronRightIcon from "@assets/icons/levels/chevron-right.svg";

import { styles } from "./season-summary-styles";

interface ITrophyReset {
  before: number;
  after: number;
}

const TrophyReset = ({ before, after }: ITrophyReset) => {
  const { t, i18n } = useTranslation();
  const { theme } = useUnistyles();
  const isReducedMotion = useReducedMotion();
  const format = (value: number) => formatNumber(value, i18n.language);

  return (
    <View style={styles.card}>
      <Text variant="eyebrow" style={styles.eyebrow}>
        {t("season.reset")}
      </Text>
      <View style={styles.reset} testID="summary-reset">
        <Text variant="number.counter" style={styles.secondary}>
          {format(before)}
        </Text>
        <ChevronRightIcon
          width={theme.sizes.icon.m}
          height={theme.sizes.icon.m}
          color={theme.colors.text.secondary}
        />
        <Animated.View
          entering={
            isReducedMotion
              ? undefined
              : FadeInLeft.delay(theme.motion.duration.slow).duration(theme.motion.duration.slower)
          }
        >
          <Text variant="number.counter">{format(after)}</Text>
        </Animated.View>
      </View>
      <Text variant="caption" style={styles.secondary}>
        {t("season.resetRule", { threshold: format(SEASON_RESET_THRESHOLD) })}
      </Text>
    </View>
  );
};

export default TrophyReset;
