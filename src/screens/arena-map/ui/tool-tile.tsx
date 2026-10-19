import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";

import { Text } from "@shared/ui/text";

import type { EditorTool } from "../model/use-map-editor";

import { styles } from "./arena-map-styles";

interface IToolTile {
  tool: EditorTool | "random";
  count: number | null;
  max: number | null;
  isSelected: boolean;
  isDisabled: boolean;
  flashKey: number;
  onPress: () => void;
}

const DIM = 0.3;

const ToolTile = ({ tool, count, max, isSelected, isDisabled, flashKey, onPress }: IToolTile) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const isReducedMotion = useReducedMotion();
  const opacity = useSharedValue(1);
  const counterStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const isFull = count !== null && max !== null && count >= max;
  styles.useVariants({ isSelected, isFull });

  useEffect(() => {
    if (flashKey === 0 || isReducedMotion) return;
    const duration = theme.motion.duration.fast;
    opacity.set(
      withSequence(
        withTiming(DIM, { duration }),
        withTiming(1, { duration }),
        withTiming(DIM, { duration }),
        withTiming(1, { duration }),
      ),
    );
  }, [flashKey, isReducedMotion, opacity, theme.motion.duration.fast]);

  const label = t(`map.tools.${tool}`);
  const counter = count === null || max === null ? null : t("map.counter", { count, max });

  return (
    <Pressable
      testID={`tool-${tool}`}
      accessibilityRole="button"
      accessibilityLabel={counter === null ? label : `${label}, ${counter}`}
      accessibilityState={{ selected: isSelected, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={styles.tile}
    >
      <Text variant="button.s" numberOfLines={1}>
        {label}
      </Text>
      {counter === null ? null : (
        <Animated.View style={counterStyle}>
          <Text variant="caption" style={styles.counter}>
            {counter}
          </Text>
        </Animated.View>
      )}
    </Pressable>
  );
};

export default ToolTile;
