import type { ReactNode } from "react";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";

import { Text } from "../text";

import { styles } from "./hud-counter-styles";

export type HudCounterTone = "normal" | "warning" | "danger";

interface IHudCounter {
  label: string;
  value: string;
  tone?: HudCounterTone;
  icon?: ReactNode;
  accessibilityLabel?: string;
}

const PULSE_SCALE = 1.08;

const HudCounter = ({ label, value, tone = "normal", icon, accessibilityLabel }: IHudCounter) => {
  const { theme } = useUnistyles();
  const isReducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const duration = theme.motion.duration.slower;
  styles.useVariants({ tone });

  useEffect(() => {
    if (tone !== "danger" || isReducedMotion) {
      cancelAnimation(scale);
      scale.set(1);
      return;
    }
    scale.set(
      withRepeat(
        withSequence(withTiming(PULSE_SCALE, { duration }), withTiming(1, { duration })),
        -1,
      ),
    );
  }, [tone, isReducedMotion, scale, duration]);

  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={accessibilityLabel ?? `${label}: ${value}`}
    >
      <View style={styles.labelRow}>
        {icon}
        <Text variant="eyebrow" style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Animated.View style={pulseStyle}>
        <Text variant="number.counter" style={styles.value} numberOfLines={1}>
          {value}
        </Text>
      </Animated.View>
    </View>
  );
};

export default HudCounter;
