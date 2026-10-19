import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";

import { styles } from "./arena-search-styles";

const FULL_TURN = 360;

const Radar = () => {
  const { theme } = useUnistyles();
  const isReducedMotion = useReducedMotion();
  const angle = useSharedValue(0);
  const sweepStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${angle.value}deg` }] }));

  useEffect(() => {
    if (isReducedMotion) return;
    angle.set(
      withRepeat(
        withTiming(FULL_TURN, {
          duration: theme.motion.animation.radarTurn,
          easing: Easing.linear,
        }),
        -1,
      ),
    );
  }, [angle, isReducedMotion, theme.motion.animation.radarTurn]);

  return (
    <View style={styles.radar} importantForAccessibility="no-hide-descendants">
      <View style={styles.radarRing} />
      <View style={styles.radarInner} />
      <Animated.View style={[styles.sweepHolder, sweepStyle]}>
        <View style={styles.sweep} />
      </Animated.View>
    </View>
  );
};

export default Radar;
