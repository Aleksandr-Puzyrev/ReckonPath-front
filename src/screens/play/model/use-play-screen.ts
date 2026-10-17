import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AccessibilityInfo, AppState, BackHandler } from "react-native";

import type { GameEvent, Idx } from "@reckon-path/engine";

import { TUTORIAL } from "@reckon-path/content";

import { useClockOffset } from "@entities/app-config";
import { dailyDayQueryOptions } from "@entities/daily";
import { selectHasSavedSession, useGameSessionStore } from "@entities/level";
import type { Attempt } from "@entities/outbox";
import { useProgressStore } from "@entities/progress";
import { useRulesStore } from "@entities/rules";
import { finishAttempt, isCountedDailyLevel } from "@features/finish-attempt";
import { flagCell } from "@features/flag-cell";
import { offerLinkAfterLevel } from "@features/link-account";
import { useInterstitial } from "@features/show-interstitial";
import { tapCell, unlockTapInput } from "@features/tap-cell";
import type { AdMessageKey } from "@entities/ad";
import { motion } from "@shared/theme";
import type { ToastMessage } from "@shared/ui/toast";
import { useBoardFx } from "@widgets/board";

import { resolvePlayLevel } from "./resolve-play-level";
import type { PlayLevel } from "./resolve-play-level";
import { usePlayGuides } from "./use-play-guides";

export type PlayOverlay =
  "none" | "resume" | "pause" | "restartConfirm" | "win" | "lose" | "declined";

interface PendingOverlay {
  overlay: PlayOverlay;
  delay: number;
}

const LEVELS_ROUTE = "/levels";
const DAILY_ROUTE = "/daily";

const NO_STATE_CHANGE: ReadonlySet<GameEvent["type"]> = new Set(["blocked", "alreadyRevealed"]);

const hasEvent = (events: readonly GameEvent[], type: GameEvent["type"]) =>
  events.some((event) => event.type === type);

const playableLevelOf = (play: PlayLevel) =>
  play.kind === "campaign" || play.kind === "daily" ? play.level : null;

// Leaving a lost game, restarting it, or starting another level ends the attempt, so it goes to the outbox and is not offered again (выход из проигранной партии, её перезапуск или запуск другого уровня завершает попытку: она уходит в очередь и больше не предлагается).
const finishLostGame = () => {
  if (useGameSessionStore.getState().game?.status === "lost") finishAttempt();
};

// «Заново» during the counted daily attempt counts it as a loss (DLY-05) («Заново» во время зачётной попытки дейли засчитывает её как поражение).
const isCountedDailyInPlay = (play: PlayLevel) => {
  const { game, levelId } = useGameSessionStore.getState();
  return (
    play.kind === "daily" &&
    game?.status === "playing" &&
    game.movesUsed > 0 &&
    levelId !== null &&
    isCountedDailyLevel(levelId)
  );
};

export const usePlayScreen = (mode: string, id: string) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const clockOffset = useClockOffset();
  const fx = useBoardFx();
  // Resolved once: winning a level must not flip a locked check or the day (определяется один раз: победа не должна менять проверку закрытия или день).
  const [play] = useState(() =>
    resolvePlayLevel(mode, id, {
      best: useProgressStore.getState().best,
      now: Date.now() + clockOffset,
      savedLevelId: useGameSessionStore.getState().levelId,
      dailyOverride: (dayKey) =>
        queryClient.getQueryData(dailyDayQueryOptions(dayKey).queryKey)?.override ?? null,
    }),
  );
  const level = playableLevelOf(play);
  // The tutorial always starts fresh, even over a saved game (обучение всегда начинается заново, даже поверх сохранённой партии).
  const [hasSavedSession] = useState(
    () =>
      level !== null &&
      !(level.id === TUTORIAL.levelId && useRulesStore.getState().tutorial === "pending") &&
      selectHasSavedSession(level.id)(useGameSessionStore.getState()),
  );
  const guides = usePlayGuides(level);
  const interstitial = useInterstitial();
  const [overlay, setOverlay] = useState<PlayOverlay>(hasSavedSession ? "resume" : "none");
  const [pending, setPending] = useState<PendingOverlay | null>(null);
  const [isFlagMode, setIsFlagMode] = useState(false);
  const [isRecord, setIsRecord] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<Attempt | null>(null);
  const [earnShortBy, setEarnShortBy] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isBombLoss, setIsBombLoss] = useState(false);

  // Before the first paint, so the board never shows the previous level (до первой отрисовки, чтобы поле не показало прошлый уровень).
  useLayoutEffect(() => {
    if (level === null) return;
    if (!hasSavedSession) finishLostGame();
    useGameSessionStore.getState().start(level, hasSavedSession ? "resume" : "new");
    unlockTapInput();
  }, [level, hasSavedSession]);

  useEffect(() => {
    if (pending === null) return;
    const timer = setTimeout(() => {
      setOverlay(pending.overlay);
      setPending(null);
    }, pending.delay);
    return () => clearTimeout(timer);
  }, [pending]);

  const isPlaying = () => useGameSessionStore.getState().game?.status === "playing";

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active" && isPlaying())
        setOverlay((current) => (current === "none" ? "pause" : current));
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      setOverlay((current) => {
        if (current === "none" && isPlaying()) return "pause";
        if (current === "pause") return "none";
        return current;
      });
      return true;
    });
    return () => subscription.remove();
  }, []);

  // Leaving a campaign result by any button may queue the link offer and show an interstitial first (уход с итога кампании любой кнопкой может поставить в очередь предложение привязки и сначала показать межстраничную рекламу).
  const isLeavingRef = useRef(false);

  const leaveResult = async () => {
    if (play.kind !== "campaign") return;
    if (overlay === "win") offerLinkAfterLevel(play.number);
    const status = useGameSessionStore.getState().game?.status;
    if (guides.isTutorialLevel || (status !== "won" && status !== "lost")) return;
    interstitial.finishLevel();
    await interstitial.showIfDue();
  };

  // A second tap while an interstitial is coming must not count the level again or navigate twice (повторный тап, пока идёт межстраничная реклама, не должен второй раз засчитать уровень и перейти).
  const once = (action: () => Promise<void>) => async () => {
    if (isLeavingRef.current) return;
    isLeavingRef.current = true;
    try {
      await action();
    } finally {
      isLeavingRef.current = false;
    }
  };

  const exit = once(async () => {
    await leaveResult();
    finishLostGame();
    if (router.canGoBack()) router.back();
    else router.replace(play.kind === "daily" ? DAILY_ROUTE : LEVELS_ROUTE);
  });

  const restart = once(async () => {
    if (level === null) return;
    await leaveResult();
    if (isCountedDailyInPlay(play)) finishAttempt();
    else finishLostGame();
    useGameSessionStore.getState().start(level, "new");
    unlockTapInput();
    setPending(null);
    setIsFlagMode(false);
    setOverlay("none");
  });

  const handleCellPress = (cell: Idx) => {
    const { game } = useGameSessionStore.getState();
    if (game === null || game.status !== "playing" || overlay !== "none") return;
    if (!guides.allowsTap(cell)) return;
    if (isFlagMode && !game.revealed.has(cell)) {
      flagCell(cell);
      return;
    }

    const events = tapCell(cell);
    fx.play(cell, events);
    if (guides.tutorialStep !== null && events.some(({ type }) => !NO_STATE_CHANGE.has(type))) {
      guides.handleTutorialTap();
    }
    if (hasEvent(events, "targetFound")) {
      AccessibilityInfo.announceForAccessibility(t("play.found"));
    }
    if (hasEvent(events, "win")) {
      guides.handleTutorialWin();
      const finished = finishAttempt();
      setIsRecord(finished.isRecord);
      setLastAttempt(finished.attempt);
      setPending({ overlay: "win", delay: motion.animation.targetFound });
    }
    if (hasEvent(events, "lose")) {
      const isBomb = hasEvent(events, "bomb");
      setIsBombLoss(isBomb);
      setPending({ overlay: "lose", delay: isBomb ? motion.animation.bomb : 0 });
    }
  };

  const handleCellLongPress = (cell: Idx) => {
    if (overlay === "none" && isPlaying() && !guides.isBlocking && guides.tutorialStep === null) {
      flagCell(cell);
    }
  };

  const requestRestart = () => {
    const { game } = useGameSessionStore.getState();
    if (game !== null && game.movesUsed > 0 && game.status === "playing")
      setOverlay("restartConfirm");
    else void restart();
  };

  const resume = () => {
    const { game } = useGameSessionStore.getState();
    setOverlay(game?.status === "lost" ? "lose" : "none");
  };

  const goNext = once(async () => {
    if (play.kind !== "campaign" || play.next === null) return;
    await leaveResult();
    router.replace({
      pathname: "/play/[mode]/[id]",
      params: { mode: "campaign", id: play.next.level.id },
    });
  });

  const skipTutorial = () => {
    guides.handleTutorialSkip();
    useGameSessionStore.getState().finish();
    router.replace(LEVELS_ROUTE);
  };

  return {
    play,
    guides,
    hasNext: play.kind === "campaign" && play.next !== null,
    isCountedRestart: overlay === "restartConfirm" && isCountedDailyInPlay(play),
    fx,
    overlay,
    isFlagMode,
    isRecord,
    lastAttempt,
    isBombLoss,
    handleCellPress,
    handleCellLongPress,
    handleToggleFlagMode: () => setIsFlagMode((value) => !value),
    handlePause: () => setOverlay("pause"),
    handleResume: resume,
    handleRestartRequest: requestRestart,
    handleRestart: restart,
    handleContinued: () => setOverlay("none"),
    handleDecline: () => setOverlay("declined"),
    handleNext: goNext,
    handleExit: exit,
    handleHome: () => router.replace("/"),
    earnShortBy,
    toast,
    handleShortOfEmeralds: setEarnShortBy,
    handleEarnClose: () => setEarnShortBy(null),
    handleEarnDaily: () => {
      setEarnShortBy(null);
      router.push(DAILY_ROUTE);
    },
    handleContinueError: (messageKey: AdMessageKey) =>
      setToast((current) => ({ id: (current?.id ?? 0) + 1, text: t(messageKey) })),
    handleToastHide: () => setToast(null),
    handleTutorialSkip: skipTutorial,
    handleRules: () => {
      setOverlay("none");
      guides.handleRulesOpen();
    },
  };
};
