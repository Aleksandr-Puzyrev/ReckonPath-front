import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import type { ArenaHome } from "@entities/arena";
import { formatNumber } from "@shared/lib";
import { Gradient } from "@shared/ui/gradient";
import { LeagueEmblem } from "@shared/ui/league-emblem";
import { Text } from "@shared/ui/text";

import { seasonDaysLeft, stepLabelOf } from "../model/league-progress";
import { leagueToneOf } from "../model/league-tone";

import { styles } from "./arena-hero-styles";
import HeroStat from "./hero-stat";
import LeagueProgress from "./league-progress";

interface IArenaHero {
  arena: Pick<ArenaHome, "trophies" | "league" | "season">;
  now: number;
}

const SEASON_DIGITS = 2;

const ArenaHero = ({ arena, now }: IArenaHero) => {
  const { t, i18n } = useTranslation();
  const { theme } = useUnistyles();
  const { trophies, league, season } = arena;

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
        <LeagueEmblem league={leagueToneOf(league.league)} numeral={league.division} />
      </View>
      <View style={styles.stats}>
        <HeroStat label={t("arena.stats.trophies")} value={formatNumber(trophies, i18n.language)} />
        <HeroStat label={t("arena.stats.league")} value={stepLabelOf(league)} />
        {season === undefined ? null : (
          <HeroStat
            label={t("arena.stats.season")}
            value={t("arena.seasonValue", {
              n: String(season.number).padStart(SEASON_DIGITS, "0"),
              days: seasonDaysLeft(season.endsAt, now),
            })}
          />
        )}
      </View>
      <LeagueProgress
        trophies={trophies}
        fromTrophies={trophies}
        league={league}
        next={league.next}
        isOnHero
      />
    </View>
  );
};

export default ArenaHero;
