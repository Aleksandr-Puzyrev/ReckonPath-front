import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { moveLimitOf } from "@reckon-path/engine";

import { useDailyRecordStore } from "@entities/daily";
import { levelStarsOf, useGameSessionStore } from "@entities/level";
import { useOutboxStore } from "@entities/outbox";
import type { Attempt } from "@entities/outbox";
import { streakForecastOf, useStreakQuery } from "@entities/streak";
import { useDailyToday } from "@features/daily-today";
import { useIsOnline } from "@shared/api";
import { formatDuration } from "@shared/lib";
import { Button } from "@shared/ui/button";
import { Sheet } from "@shared/ui/sheet";
import { StarRating } from "@shared/ui/star-rating";
import { Text } from "@shared/ui/text";

import FlameIcon from "@assets/icons/daily/flame.svg";

import { dailyStandingOf } from "../model/daily-standing";
import type { DailyNote, DailyPlace } from "../model/daily-standing";

import { styles } from "./daily-result-sheet-styles";

interface IDailyResultSheet {
  isOpen: boolean;
  dayKey: string;
  attempt: Attempt | null;
  onAgain: () => void;
  onHome: () => void;
}

const NOTE_KEYS = {
  offline: "daily.offline",
  replay: "daily.result.replayNote",
  notRanked: "daily.result.notRanked",
} as const satisfies Record<NonNullable<DailyNote>, string>;

const DailyResultSheet = ({ isOpen, dayKey, attempt, onAgain, onHome }: IDailyResultSheet) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const game = useGameSessionStore((state) => state.game);
  const record = useDailyRecordStore((state) => state.days[dayKey]);
  const { todayKey, yesterdayKey } = useDailyToday();
  const { data: streak } = useStreakQuery();
  const isOnline = useIsOnline();
  const isPending = useOutboxStore((state) =>
    state.attempts.some(({ attemptId }) => attemptId === attempt?.attemptId),
  );
  if (game === null) return null;

  const stars = levelStarsOf(game);
  const limit = moveLimitOf(game);
  const isCounted = attempt !== null && record?.attemptId === attempt.attemptId;
  const forecast = streakForecastOf(streak, {
    todayKey,
    yesterdayKey,
    hasCountedToday: record !== undefined && dayKey === todayKey,
  });
  const standing = dailyStandingOf({ record, isCounted, isPending, isOnline });
  const iconSize = theme.sizes.icon.xl;

  const placeText = (place: DailyPlace) => {
    if (place.kind === "rank") return t("daily.result.rank", { rank: place.rank });
    if (place.kind === "counting") return t("daily.result.counting");
    if (place.kind === "none") return t("daily.result.noPlace");
    return null;
  };
  const place = placeText(standing.place);
  const isRanked = standing.place.kind === "rank";

  return (
    <Sheet isOpen={isOpen} onDismiss={onHome} isDismissible={false}>
      <View style={styles.header}>
        <View>
          <Text variant="eyebrow" style={styles.eyebrow}>
            {t("daily.result.eyebrow")}
          </Text>
          <Text variant="display.m">{t("daily.result.title")}</Text>
        </View>
        <StarRating stars={stars} accessibilityLabel={t("result.stars", { count: stars })} />
      </View>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text variant="eyebrow" style={styles.label}>
            {t("daily.result.moves")}
          </Text>
          <Text variant="title.m">
            {limit === null
              ? game.movesUsed
              : t("daily.result.movesOf", { used: game.movesUsed, limit })}
          </Text>
        </View>
        <View style={[styles.stat, styles.statDivider]}>
          <Text variant="eyebrow" style={styles.label}>
            {t("daily.result.time")}
          </Text>
          <Text variant="title.m">{formatDuration(attempt?.durationMs ?? 0)}</Text>
        </View>
        <View style={[styles.stat, styles.statDivider]}>
          <Text variant="eyebrow" style={styles.label}>
            {t("daily.result.place")}
          </Text>
          {place === null ? null : (
            <Text
              variant={standing.place.kind === "counting" ? "body.s" : "title.m"}
              style={isRanked ? styles.place : styles.muted}
            >
              {place}
            </Text>
          )}
        </View>
      </View>
      {standing.note === null ? null : (
        <Text variant="body.s" style={styles.muted}>
          {t(NOTE_KEYS[standing.note])}
        </Text>
      )}
      <View style={styles.streak}>
        <FlameIcon width={iconSize} height={iconSize} color={theme.colors.feedback.warm} />
        <Text variant="title.s">
          {t(isCounted ? "daily.result.streakToday" : "daily.result.streak", {
            count: forecast.current,
          })}
        </Text>
      </View>
      {standing.topPercent === null ? null : (
        <Text variant="body.s" style={styles.muted}>
          {t("daily.result.top", { percent: standing.topPercent })}
        </Text>
      )}
      <View style={styles.actions}>
        <View style={styles.action}>
          <Button label={t("daily.result.again")} onPress={onAgain} size="l" />
        </View>
        <View style={styles.action}>
          <Button label={t("daily.result.home")} onPress={onHome} size="l" />
        </View>
      </View>
    </Sheet>
  );
};

export default DailyResultSheet;
