import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { AdMessageKey } from "@entities/ad";
import {
  dailyLevelId,
  dayResultOf,
  todayOf,
  useDailyHistoryQuery,
  useDailyLeaderboardQuery,
  useDailyQuery,
} from "@entities/daily";
import { useAccountStore } from "@entities/session";
import { streakSummaryOf, useStreakQuery } from "@entities/streak";
import { useDailyToday } from "@features/daily-today";
import { restoreOfferOf, useRestoreStreak } from "@features/restore-streak";
import { errorMessageKey, isApiError } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";
import type { ToastMessage } from "@shared/ui/toast";

import { isRestoreFirst } from "./restore-first";

export type DailyScreenState =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "unavailable" }
  | { kind: "offline" }
  | { kind: "failed"; messageKey: ErrorMessageKey };

// Without a connection the query waits paused, so a missing day then means no network (без связи запрос ждёт на паузе, поэтому отсутствие дня тогда означает «нет сети»).
const stateOf = (hasDay: boolean, isPaused: boolean, error: unknown): DailyScreenState => {
  if (hasDay) return { kind: "ready" };
  if (isPaused) return { kind: "offline" };
  if (error === null) return { kind: "loading" };
  if (!isApiError(error)) return { kind: "offline" };
  if (error.code === "daily_unavailable") return { kind: "unavailable" };
  return { kind: "failed", messageKey: errorMessageKey(error) };
};

export const useDailyScreen = () => {
  const { t } = useTranslation();
  const { todayKey } = useDailyToday();
  const daily = useDailyQuery();
  const { data: streakView } = useStreakQuery();
  const history = useDailyHistoryQuery();
  const leaderboard = useDailyLeaderboardQuery();
  const hasLogin = useAccountStore((state) => state.hasLogin);
  const [restoredDays, setRestoredDays] = useState<number | null>(null);
  const [isRestoreFirstOpen, setIsRestoreFirstOpen] = useState(false);
  const [earnShortBy, setEarnShortBy] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const streak = streakView ?? daily.data?.streak;
  const restoreOffer = restoredDays === null ? restoreOfferOf(streak) : null;
  const day = todayOf(daily.data?.day, todayKey);
  const board = todayOf(leaderboard.data, todayKey);

  const showToast = (text: string) => setToast((current) => ({ id: (current?.id ?? 0) + 1, text }));
  const restoreCallbacks = {
    onRestored: (days: number) => {
      setRestoredDays(days);
      showToast(t("streak.restoredToast", { count: days }));
    },
    onShortOfEmeralds: setEarnShortBy,
    onError: (messageKey: AdMessageKey) => showToast(t(messageKey)),
  };
  const restore = useRestoreStreak(streak?.restoreCost ?? 0, restoreCallbacks);

  const startPlay = () =>
    router.push({
      pathname: "/play/[mode]/[id]",
      params: { mode: "daily", id: dailyLevelId(todayKey) },
    });

  return {
    state: stateOf(day !== undefined, daily.fetchStatus === "paused", daily.error),
    hasLogin,
    todayKey,
    day,
    rewards: daily.data?.rewards,
    streak: streakSummaryOf(streak),
    wonDays: new Set((history.data?.days ?? []).map(({ date }) => date)),
    leaderboard: board,
    hasWon: dayResultOf(day) !== null,
    restoreOffer,
    restoredDays,
    restoreCallbacks,
    isRestoreFirstOpen,
    earnShortBy,
    toast,
    handleEarnClose: () => setEarnShortBy(null),
    handleToastHide: () => setToast(null),
    handleRetry: () => void daily.refetch(),
    handlePlay: () => {
      if (isRestoreFirst(streak)) setIsRestoreFirstOpen(true);
      else startPlay();
    },
    handleRestoreFirst: () => {
      setIsRestoreFirstOpen(false);
      restore.handleRestore();
    },
    handlePlayAnyway: () => {
      setIsRestoreFirstOpen(false);
      startPlay();
    },
    handleRestoreFirstClose: () => setIsRestoreFirstOpen(false),
    handleBack: () => (router.canGoBack() ? router.back() : router.replace("/")),
  };
};
