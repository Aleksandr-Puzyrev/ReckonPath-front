import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";

import { formatNumber } from "@shared/lib";
import { Text } from "@shared/ui/text";

import { leagueToneOf } from "../model/league-tone";
import { divisionShare, leagueLabelOf, nextDivisionOf } from "../model/league-progress";

import { styles } from "./league-progress-styles";

interface ILeagueProgress {
  trophies: number;
  fromTrophies: number;
  league: string;
  division: number;
  min: number;
  max: number;
  isOnHero: boolean;
}

const PERCENT = 100;

const LeagueProgress = ({
  trophies,
  fromTrophies,
  league,
  division,
  min,
  max,
  isOnHero,
}: ILeagueProgress) => {
  const { t, i18n } = useTranslation();
  const { theme } = useUnistyles();
  const isReducedMotion = useReducedMotion();
  const label = leagueLabelOf(league, division);
  const next = nextDivisionOf(league, division);
  const target = divisionShare(trophies, min, max);
  const share = useSharedValue(divisionShare(fromTrophies, min, max));
  const fillStyle = useAnimatedStyle(() => ({ width: `${share.value * PERCENT}%` }));
  styles.useVariants({ isOnHero });

  useEffect(() => {
    share.set(
      isReducedMotion ? target : withTiming(target, { duration: theme.motion.duration.slower }),
    );
  }, [share, target, isReducedMotion, theme.motion.duration.slower]);

  if (next === null) return null;
  return (
    <View style={styles.progress}>
      <View style={styles.texts}>
        <Text variant="caption" style={styles.text}>
          {label}
        </Text>
        <Text variant="caption" style={styles.text}>
          {t("arena.progress", {
            trophies: formatNumber(trophies, i18n.language),
            max: formatNumber(max, i18n.language),
            next,
          })}
        </Text>
      </View>
      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityValue={{ min, max, now: trophies }}
      >
        <Animated.View
          style={[
            styles.fill,
            fillStyle,
            { backgroundColor: theme.colors.league[leagueToneOf(league)] },
          ]}
        />
      </View>
    </View>
  );
};

export default LeagueProgress;
