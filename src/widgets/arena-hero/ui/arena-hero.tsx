import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import type { Arena } from "@entities/arena";
import { formatNumber } from "@shared/lib";
import { Gradient } from "@shared/ui/gradient";
import { LeagueEmblem } from "@shared/ui/league-emblem";
import { Text } from "@shared/ui/text";

import { leagueToneOf } from "../model/league-tone";
import {
  divisionNumeral,
  divisionShare,
  leagueLabelOf,
  nextDivisionOf,
  seasonDaysLeft,
} from "../model/league-progress";

import { styles } from "./arena-hero-styles";
import HeroStat from "./hero-stat";

interface IArenaHero {
  profile: Arena["profile"];
  season: Arena["season"];
  now: number;
}

const SEASON_DIGITS = 2;

const ArenaHero = ({ profile, season, now }: IArenaHero) => {
  const { t, i18n } = useTranslation();
  const { theme } = useUnistyles();
  const { trophies, league, division, divisionMin, divisionMax } = profile;
  const label = leagueLabelOf(league, division);
  const next = nextDivisionOf(league, division);
  const share = divisionShare(trophies, divisionMin, divisionMax);
  const tone = leagueToneOf(league);

  return (
    <View style={styles.hero}>
      <Gradient name="heroArena" radius={theme.radius.xl} />
      <View style={styles.head}>
        <View style={styles.texts}>
          <Text variant="eyebrow" style={styles.eyebrow}>
            {t("arena.eyebrow")}
          </Text>
          <Text variant="display.m" style={styles.title} accessibilityRole="header">
            {t("arena.title")}
          </Text>
        </View>
        <LeagueEmblem league={tone} numeral={divisionNumeral(division)} />
      </View>
      <View style={styles.stats}>
        <HeroStat label={t("arena.stats.trophies")} value={formatNumber(trophies, i18n.language)} />
        <HeroStat label={t("arena.stats.league")} value={label} />
        <HeroStat
          label={t("arena.stats.season")}
          value={t("arena.seasonValue", {
            n: String(season.id).padStart(SEASON_DIGITS, "0"),
            days: seasonDaysLeft(season.endsAt, now),
          })}
        />
      </View>
      {next === null ? null : (
        <View style={styles.progress}>
          <View style={styles.progressTexts}>
            <Text variant="caption" style={styles.dim}>
              {label}
            </Text>
            <Text variant="caption" style={styles.dim}>
              {t("arena.progress", {
                trophies: formatNumber(trophies, i18n.language),
                max: formatNumber(divisionMax, i18n.language),
                next,
              })}
            </Text>
          </View>
          <View
            style={styles.track}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: divisionMin, max: divisionMax, now: trophies }}
          >
            <View
              style={[
                styles.fill,
                { width: `${share * 100}%`, backgroundColor: theme.colors.league[tone] },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default ArenaHero;
