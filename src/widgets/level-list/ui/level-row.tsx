import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";

import { describeLevel } from "@entities/level";
import { Gradient } from "@shared/ui/gradient";
import { StarRating } from "@shared/ui/star-rating";
import { Text } from "@shared/ui/text";

import CheckIcon from "@assets/icons/levels/check.svg";

import type { LevelItem } from "../model/build-list-items";
import { levelTitleOf } from "../model/level-title";

import { styles } from "./level-row-styles";

interface ILevelRow {
  item: LevelItem;
  onPress: (item: LevelItem) => void;
}

const SHAKE_STEPS = 4;

const LevelRow = ({ item, onPress }: ILevelRow) => {
  const { t, i18n } = useTranslation();
  const { theme } = useUnistyles();
  const isReducedMotion = useReducedMotion();
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const { campaignLevel, state, best } = item;
  const { level, number } = campaignLevel;
  styles.useVariants({ state });

  const description = describeLevel(t, level);
  const title =
    state === "locked"
      ? t("levels.lockedRow", { n: number, description })
      : levelTitleOf(t, i18n.language, campaignLevel);
  const stars = best?.stars ?? 0;
  const accessibilityLabel = {
    done: t("levels.a11y.done", { n: number, stars }),
    current: t("levels.a11y.current", { n: number }),
    locked: t("levels.a11y.locked", { n: number }),
  }[state];

  const handlePress = () => {
    if (state === "locked" && !isReducedMotion) {
      const { distance } = theme.motion.shake.lockedRow;
      const step = theme.motion.animation.blockedShake / SHAKE_STEPS;
      shake.set(
        withSequence(
          withTiming(-distance, { duration: step }),
          withTiming(distance, { duration: step }),
          withTiming(-distance / 2, { duration: step }),
          withTiming(0, { duration: step }),
        ),
      );
    }
    onPress(item);
  };

  return (
    <Animated.View style={shakeStyle}>
      <Pressable
        testID={`level-${level.id}`}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: state === "locked" }}
        onPress={handlePress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <View style={styles.tile}>
          {state === "done" ? <Gradient name="levelDone" radius={theme.radius.m} /> : null}
          {state === "current" ? <Gradient name="levelCurrent" radius={theme.radius.m} /> : null}
          {state === "done" ? (
            <CheckIcon
              width={theme.sizes.icon.m}
              height={theme.sizes.icon.m}
              color={theme.colors.text.onAccent}
            />
          ) : null}
          {state === "current" ? (
            <Text variant="number.counter" style={styles.tileNumber}>
              {String(number)}
            </Text>
          ) : null}
        </View>
        <View style={styles.texts}>
          <Text variant="title.s" numberOfLines={1}>
            {title}
          </Text>
          {state === "locked" ? null : (
            <Text variant="caption" style={styles.description} numberOfLines={1}>
              {description}
            </Text>
          )}
        </View>
        {state === "done" ? <StarRating stars={stars} /> : null}
        {state === "current" ? (
          <View style={styles.play}>
            <Gradient name="primary" radius={theme.radius.s} />
            <Text variant="button.s" style={styles.playText}>
              {t("home.play").toLocaleUpperCase(i18n.language)}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
};

export default LevelRow;
