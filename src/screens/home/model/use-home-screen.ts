import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useArenaUnlock } from "@features/arena-access";
import { useSeenGuides } from "@features/mark-guides-seen";
import { restoreOfferOf } from "@features/restore-streak";
import type { AdMessageKey } from "@entities/ad";
import { useServerMinute } from "@entities/app-config";
import { formatDropLeft, useShopQuery } from "@entities/item";
import { RESUME_PARAM, useCampaignQuery } from "@entities/level";
import type { CampaignOverview } from "@entities/level";
import { TUTORIAL_KEYS } from "@entities/rules";
import { useStreakQuery } from "@entities/streak";
import { useMeQuery } from "@entities/wallet";
import { useAccountStore } from "@entities/session";
import { useIsOnline } from "@shared/api";
import { formatClockTime, formatNumber } from "@shared/lib";
import type { ToastMessage } from "@shared/ui/toast";
import { leagueLabelOf } from "@widgets/arena-hero";
import type { ArenaLink, TodayStat } from "@widgets/home-summary";

// Part 4 §2.2: the Home coach marks come on the first visit after level 3 (Часть 4 §2.2: коуч-марки главной появляются при первом входе после уровня 3).
const TOUR_AFTER_LEVEL = 3;

const levelsOf = (overview: CampaignOverview | undefined) =>
  (overview?.worlds ?? []).flatMap(({ levels }) => levels);

export const useHomeScreen = () => {
  const { t, i18n } = useTranslation();
  const { data: campaign } = useCampaignQuery();
  const seen = useSeenGuides();
  const me = useMeQuery();
  const hasLogin = useAccountStore((state) => state.hasLogin);
  const { data: streakData } = useStreakQuery();
  const { data: shop } = useShopQuery();
  const isOnline = useIsOnline();
  const now = useServerMinute();
  const [earnShortBy, setEarnShortBy] = useState<number | null>(null);
  const [isEarnOpen, setIsEarnOpen] = useState(false);
  const [restoredDays, setRestoredDays] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (text: string) => setToast((current) => ({ id: (current?.id ?? 0) + 1, text }));
  const format = (value: number) => formatNumber(value, i18n.language);
  const arenaUnlock = useArenaUnlock();
  const isArenaOpen = arenaUnlock.isUnlocked;
  const isTutorialSeen = seen.isTutorialSeen(TUTORIAL_KEYS.firstLevel);
  const levels = levelsOf(campaign);
  const tutorialLevel = levels.find(({ tutorial }) => tutorial === TUTORIAL_KEYS.firstLevel);
  const tourLevel = levels.find(({ number }) => number === TOUR_AFTER_LEVEL);
  const tutorialToStart =
    tutorialLevel?.state === "current" && !isTutorialSeen ? tutorialLevel.number : null;
  const arena = hasLogin ? me.data?.arena : undefined;
  const featured = hasLogin ? (shop?.featured ?? null) : null;
  const dropMs = featured === null ? 0 : Date.parse(featured.endsAt) - now;

  // A new player starts with the server's tutorial level (новый игрок начинает с уровня обучения с сервера).
  useEffect(() => {
    if (tutorialToStart === null) return;
    router.replace({
      pathname: "/play/[mode]/[id]",
      params: { mode: "campaign", id: String(tutorialToStart) },
    });
  }, [tutorialToStart]);

  const arenaLink: ArenaLink = isArenaOpen
    ? {
        isUnlocked: true,
        status:
          arena === undefined
            ? ""
            : `${leagueLabelOf(arena.league, arena.division)} · ${format(arena.trophies)}`,
      }
    : { isUnlocked: false, unlockLevel: arenaUnlock.unlockLevel };

  // The streak and the trophies live on the server, so a guest sees only what the device knows (серия и кубки хранятся на сервере, поэтому гость видит только то, что знает устройство).
  const stats: TodayStat[] = hasLogin
    ? [{ key: "streak", label: t("home.stats.streak"), value: format(streakData?.current ?? 0) }]
    : [];
  if (!isArenaOpen || !hasLogin) {
    stats.push(
      {
        key: "stars",
        label: t("home.stats.stars"),
        value: format(campaign?.stars ?? 0),
      },
      { key: "levels", label: t("home.stats.levels"), value: format(campaign?.levelsDone ?? 0) },
    );
  } else if (arena !== undefined) {
    stats.push({ key: "trophies", label: t("home.stats.trophies"), value: format(arena.trophies) });
  }

  return {
    isTourShown:
      isTutorialSeen &&
      !seen.isHomeTourSeen &&
      (tourLevel?.state === "done" || tourLevel?.state === "perfect"),
    handleTourDone: seen.markHomeTourSeen,
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
    restoreOffer: hasLogin && restoredDays === null ? restoreOfferOf(streakData) : null,
    earnShortBy,
    isEarnOpen,
    toast,
    showToast,
    handleToastHide: () => setToast(null),
    handlePlay: (levelNumber: number, isResuming: boolean) =>
      router.push({
        pathname: "/play/[mode]/[id]",
        params: isResuming
          ? { mode: "campaign", id: String(levelNumber), resume: RESUME_PARAM }
          : { mode: "campaign", id: String(levelNumber) },
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
