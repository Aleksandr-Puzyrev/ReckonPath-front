import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  dayKeyAfter,
  dailyLevelId,
  dailyLevelOf,
  useDailyDayQuery,
  useDailyHistoryQuery,
  useDailyRecordStore,
} from "@entities/daily";
import { selectHasSavedSession, useGameSessionStore } from "@entities/level";
import { streakForecastOf, useStreakQuery } from "@entities/streak";
import { useDailyToday } from "@features/daily-today";
import { restoreOfferOf } from "@features/restore-streak";
import type { AdMessageKey } from "@entities/ad";
import type { ToastMessage } from "@shared/ui/toast";
import type { CalendarDayResult } from "@widgets/daily-calendar";

import { calendarResultsOf } from "./calendar-results";

export const useDailyScreen = () => {
  const { t } = useTranslation();
  const { todayKey, yesterdayKey } = useDailyToday();
  const [restoredDays, setRestoredDays] = useState<number | null>(null);
  const [earnShortBy, setEarnShortBy] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
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

  const showToast = (text: string) => setToast((current) => ({ id: (current?.id ?? 0) + 1, text }));

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
    restoreOffer: restoredDays === null ? restoreOfferOf(streak, dayKeyAfter(todayKey, -2)) : null,
    restoredDays,
    earnShortBy,
    toast,
    handleRestored: (days: number) => {
      setRestoredDays(days);
      showToast(t("streak.restoredToast", { count: days }));
    },
    handleShortOfEmeralds: setEarnShortBy,
    handleError: (messageKey: AdMessageKey) => showToast(t(messageKey)),
    handleEarnClose: () => setEarnShortBy(null),
    handleToastHide: () => setToast(null),
    handlePlay: () =>
      router.push({ pathname: "/play/[mode]/[id]", params: { mode: "daily", id: levelId } }),
    handleBack: () => (router.canGoBack() ? router.back() : router.replace("/")),
  };
};
