import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";

import { styles } from "./splash-styles";

interface ISonarRing {
  delay: number;
}

const START_SCALE = 0.3;

const SonarRing = ({ delay }: ISonarRing) => {
  const { theme } = useUnistyles();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(
      withDelay(
        delay,
        withRepeat(
          withTiming(1, {
            duration: theme.motion.animation.radarTurn,
            easing: Easing.bezier(...theme.motion.easing.decelerate),
          }),
          -1,
        ),
      ),
    );
  }, [progress, delay, theme.motion]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.get(),
    transform: [{ scale: START_SCALE + (1 - START_SCALE) * progress.get() }],
  }));

  return <Animated.View style={[styles.ring, style]} />;
};

export default SonarRing;
