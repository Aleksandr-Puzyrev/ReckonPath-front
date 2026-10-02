import { router } from "expo-router";

import {
  dailyLevelId,
  dailyLevelOf,
  useDailyDayQuery,
  useDailyHistoryQuery,
  useDailyRecordStore,
} from "@entities/daily";
import { selectHasSavedSession, useGameSessionStore } from "@entities/level";
import { streakForecastOf, useStreakQuery } from "@entities/streak";
import { useDailyToday } from "@features/daily-today";
import type { CalendarDayResult } from "@widgets/daily-calendar";

import { calendarResultsOf } from "./calendar-results";

export const useDailyScreen = () => {
  const { todayKey, yesterdayKey } = useDailyToday();
  const day = useDailyDayQuery(todayKey);
  const history = useDailyHistoryQuery();
  const { data: streak } = useStreakQuery();
  const records = useDailyRecordStore((state) => state.days);
  const levelId = dailyLevelId(todayKey);
  const hasSavedGame = useGameSessionStore(selectHasSavedSession(levelId));
  const record = records[todayKey];
  const level = dailyLevelOf(todayKey, day.data?.override ?? null);
  const hasPlayed = record !== undefined || day.data?.me.played === true;
  const rank = day.data?.me.rank ?? record?.rank ?? null;
  const results: ReadonlyMap<string, CalendarDayResult> = calendarResultsOf(
    history.data?.days ?? [],
    records,
  );

  return {
    todayKey,
    level,
    record,
    hasSavedGame,
    hasPlayed,
    streak: streakForecastOf(streak, {
      todayKey,
      yesterdayKey,
      hasCountedToday: record !== undefined,
    }),
    results,
    top: day.data?.leaderboardPreview.top ?? (day.isError ? null : []),
    median: day.data?.leaderboardPreview.median ?? null,
    myPlace: rank === null || record === undefined ? null : { rank, moves: record.movesUsed },
    handlePlay: () =>
      router.push({ pathname: "/play/[mode]/[id]", params: { mode: "daily", id: levelId } }),
    handleBack: () => (router.canGoBack() ? router.back() : router.replace("/")),
  };
};
