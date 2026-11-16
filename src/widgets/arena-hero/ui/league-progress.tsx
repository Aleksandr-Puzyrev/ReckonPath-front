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

import type { LeagueStep } from "@entities/arena";
import { formatNumber } from "@shared/lib";
import { Text } from "@shared/ui/text";

import { leagueToneOf } from "../model/league-tone";
import { divisionShare, stepLabelOf } from "../model/league-progress";

import { styles } from "./league-progress-styles";

interface ILeagueProgress {
  trophies: number;
  fromTrophies: number;
  league: LeagueStep;
  next: LeagueStep | undefined;
  isOnHero: boolean;
}

const PERCENT = 100;

const LeagueProgress = ({ trophies, fromTrophies, league, next, isOnHero }: ILeagueProgress) => {
  const { t, i18n } = useTranslation();
  const { theme } = useUnistyles();
  const isReducedMotion = useReducedMotion();
  const { min } = league;
  const max = next?.min ?? min;
  const target = divisionShare(trophies, min, max);
  const share = useSharedValue(divisionShare(fromTrophies, min, max));
  const fillStyle = useAnimatedStyle(() => ({ width: `${share.value * PERCENT}%` }));
  styles.useVariants({ isOnHero });

  useEffect(() => {
    share.set(
      isReducedMotion ? target : withTiming(target, { duration: theme.motion.duration.slower }),
    );
  }, [share, target, isReducedMotion, theme.motion.duration.slower]);

  if (next === undefined) return null;
  return (
    <View style={styles.progress}>
      <View style={styles.texts}>
        <Text variant="caption" style={styles.text}>
          {stepLabelOf(league)}
        </Text>
        <Text variant="caption" style={styles.text}>
          {t("arena.progress", {
            trophies: formatNumber(trophies, i18n.language),
            max: formatNumber(max, i18n.language),
            next: stepLabelOf(next),
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
            { backgroundColor: theme.colors.league[leagueToneOf(league.league)] },
          ]}
        />
      </View>
    </View>
  );
};

export default LeagueProgress;
