import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { TUTORIAL } from "@reckon-path/content";

import { ARENA_UNLOCK_LEVEL, isArenaUnlocked } from "@features/arena-access";
import { useDailyToday } from "@features/daily-today";
import { restoreOfferOf } from "@features/restore-streak";
import type { AdMessageKey } from "@entities/ad";
import { useServerMinute } from "@entities/app-config";
import { dayKeyAfter, useDailyRecordStore } from "@entities/daily";
import { formatDropLeft, useShopQuery } from "@entities/item";
import { CAMPAIGN_LEVELS, CAMPAIGN_WORLDS, RESUME_PARAM } from "@entities/level";
import { campaignStars, useProgressStore } from "@entities/progress";
import { useRulesStore } from "@entities/rules";
import { useSettingsStore } from "@entities/settings";
import { streakForecastOf, useStreakQuery } from "@entities/streak";
import { useMeQuery } from "@entities/wallet";
import { useIsOnline } from "@shared/api";
import { isSystemLanguageSupported } from "@shared/i18n";
import { formatClockTime, formatNumber } from "@shared/lib";
import type { ToastMessage } from "@shared/ui/toast";
import { leagueLabelOf } from "@widgets/arena-hero";
import type { ArenaLink, TodayStat } from "@widgets/home-summary";

// Part 4 §2.2: the Home coach marks come on the first visit after level 3 (Часть 4 §2.2: коуч-марки главной появляются при первом входе после уровня 3).
const TOUR_AFTER_LEVEL = 3;

export const useHomeScreen = () => {
  const { t, i18n } = useTranslation();
  const best = useProgressStore((state) => state.best);
  const me = useMeQuery();
  const { data: streakData } = useStreakQuery();
  const { data: shop } = useShopQuery();
  const { todayKey, yesterdayKey } = useDailyToday();
  const record = useDailyRecordStore((state) => state.days[todayKey]);
  const isOnline = useIsOnline();
  const now = useServerMinute();
  const [earnShortBy, setEarnShortBy] = useState<number | null>(null);
  const [isEarnOpen, setIsEarnOpen] = useState(false);
  const [restoredDays, setRestoredDays] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (text: string) => setToast((current) => ({ id: (current?.id ?? 0) + 1, text }));
  const format = (value: number) => formatNumber(value, i18n.language);
  const isArenaOpen = isArenaUnlocked(best);
  const tutorial = useRulesStore((state) => state.tutorial);
  const hasSeenHomeTour = useRulesStore((state) => state.hasSeenHomeTour);
  const tourLevelId = CAMPAIGN_LEVELS[TOUR_AFTER_LEVEL - 1]?.level.id;
  const arena = me.data?.arena;
  const streak = streakForecastOf(streakData, {
    todayKey,
    yesterdayKey,
    hasCountedToday: record !== undefined,
  });
  const featured = shop?.featured ?? null;
  const dropMs = featured === null ? 0 : Date.parse(featured.endsAt) - now;

  // A new player starts with the level 1 tutorial, after the language step when the system language is not supported (новый игрок начинает с обучения на уровне 1, а при неподдерживаемом языке системы — после выбора языка).
  useEffect(() => {
    if (useRulesStore.getState().tutorial !== "pending") return;
    if (useSettingsStore.getState().language === null && !isSystemLanguageSupported()) {
      router.replace("/onboarding/language");
      return;
    }
    router.replace({
      pathname: "/play/[mode]/[id]",
      params: { mode: "campaign", id: TUTORIAL.levelId },
    });
  }, []);

  const arenaLink: ArenaLink = isArenaOpen
    ? {
        isUnlocked: true,
        status:
          arena === undefined
            ? ""
            : `${leagueLabelOf(arena.league, arena.division)} · ${format(arena.trophies)}`,
      }
    : { isUnlocked: false, unlockLevel: ARENA_UNLOCK_LEVEL };

  const stats: TodayStat[] = [
    { key: "streak", label: t("home.stats.streak"), value: format(streak.current) },
  ];
  if (!isArenaOpen) {
    stats.push(
      {
        key: "stars",
        label: t("home.stats.stars"),
        value: format(campaignStars(CAMPAIGN_WORLDS, best)),
      },
      { key: "levels", label: t("home.stats.levels"), value: format(Object.keys(best).length) },
    );
  } else if (arena !== undefined) {
    stats.push({ key: "trophies", label: t("home.stats.trophies"), value: format(arena.trophies) });
  }

  return {
    isTourShown:
      tutorial !== "pending" &&
      !hasSeenHomeTour &&
      tourLevelId !== undefined &&
      best[tourLevelId] !== undefined,
    handleTourDone: useRulesStore.getState().markHomeTourSeen,
    isOnline,
    isLoading: me.data === undefined && me.isLoading,
    arenaLink,
    dropLeft: dropMs > 0 ? formatDropLeft(t, dropMs) : null,
    stats,
    cacheNote:
      isOnline || me.data === undefined
        ? null
        : t("common.updatedAt", {
            time: formatClockTime(new Date(me.dataUpdatedAt).toISOString(), i18n.language),
          }),
    restoreOffer:
      restoredDays === null ? restoreOfferOf(streakData, dayKeyAfter(todayKey, -2)) : null,
    earnShortBy,
    isEarnOpen,
    toast,
    showToast,
    handleToastHide: () => setToast(null),
    handlePlay: (levelId: string, isResuming: boolean) =>
      router.push({
        pathname: "/play/[mode]/[id]",
        params: isResuming
          ? { mode: "campaign", id: levelId, resume: RESUME_PARAM }
          : { mode: "campaign", id: levelId },
      }),
    handleDaily: () => router.push("/daily"),
    handleArena: () => router.navigate("/arena"),
    handleShop: () => router.navigate("/shop"),
    handleRestored: (days: number) => {
      setRestoredDays(days);
      showToast(t("streak.restoredToast", { count: days }));
    },
    handleShortOfEmeralds: (shortBy: number) => {
      setEarnShortBy(shortBy);
      setIsEarnOpen(true);
    },
    handleRestoreError: (messageKey: AdMessageKey) => showToast(t(messageKey)),
    handleEarnOpen: () => {
      setEarnShortBy(null);
      setIsEarnOpen(true);
    },
    handleEarnClose: () => setIsEarnOpen(false),
  };
};
