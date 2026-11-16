import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AccessibilityInfo } from "react-native";
import { useShallow } from "zustand/react/shallow";

import { canContinue } from "@reckon-path/engine";
import type { GameEvent, Idx, LevelInput } from "@reckon-path/engine";

import { useClockOffset } from "@entities/app-config";
import { dailyDayQueryOptions } from "@entities/daily";
import {
  playViewOfGame,
  replaySession,
  selectHasSavedSession,
  useGameSessionStore,
} from "@entities/level";
import type { Attempt } from "@entities/outbox";
import { levelCardIds } from "@entities/rules";
import type { AdMessageKey } from "@entities/ad";
import { finishAttempt, isCountedDailyLevel } from "@features/finish-attempt";
import { flagCell } from "@features/flag-cell";
import { tapCell, unlockTapInput } from "@features/tap-cell";
import { motion } from "@shared/theme";
import type { ToastMessage } from "@shared/ui/toast";
import { useBoardFx } from "@widgets/board";

import { resolveDailyLevel } from "./resolve-play-level";
import { usePlayGuides } from "./use-play-guides";
import { usePlayInterrupts } from "./use-play-interrupts";
import type { PendingOverlay, PlayOverlay } from "./use-play-interrupts";

const DAILY_ROUTE = "/daily";

const hasEvent = (events: readonly GameEvent[], type: GameEvent["type"]) =>
  events.some((event) => event.type === type);

const lastTapOf = (actions: ReturnType<typeof useGameSessionStore.getState>["actions"]) =>
  actions.flatMap((action) => (action.type === "tap" ? [action.cell] : [])).at(-1) ?? null;

// Leaving a lost game or restarting it ends the attempt, so it goes to the outbox and is not offered again (выход из проигранной партии или её перезапуск завершает попытку: она уходит в очередь и больше не предлагается).
const finishLostGame = () => {
  if (useGameSessionStore.getState().game?.status === "lost") finishAttempt();
};

// «Заново» during the counted daily attempt counts it as a loss (DLY-05) («Заново» во время зачётной попытки дейли засчитывает её как поражение).
const isCountedDailyInPlay = () => {
  const { game, levelId } = useGameSessionStore.getState();
  return (
    game?.status === "playing" &&
    game.movesUsed > 0 &&
    levelId !== null &&
    isCountedDailyLevel(levelId)
  );
};

const initialOverlayOf = (level: LevelInput | null, hasSavedSession: boolean): PlayOverlay => {
  if (level === null || !hasSavedSession) return "none";
  const { actions } = useGameSessionStore.getState();
  return replaySession(level, actions).status === "lost" ? "lose" : "resume";
};

export const useDailyPlay = (id: string, isUnlocked: boolean) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const clockOffset = useClockOffset();
  const fx = useBoardFx();
  // Resolved once: winning must not flip the day (определяется один раз: победа не должна менять день).
  const [play] = useState(() =>
    resolveDailyLevel(id, {
      isUnlocked,
      now: Date.now() + clockOffset,
      savedLevelId: useGameSessionStore.getState().levelId,
      dailyOverride: (dayKey) =>
        queryClient.getQueryData(dailyDayQueryOptions(dayKey).queryKey)?.override ?? null,
    }),
  );
  const level = play.kind === "daily" ? play.level : null;
  const [hasSavedSession] = useState(
    () => level !== null && selectHasSavedSession(level.id)(useGameSessionStore.getState()),
  );
  const { game, actions, flags } = useGameSessionStore(
    useShallow(({ game: current, actions: done, flags: marked }) => ({
      game: current,
      actions: done,
      flags: marked,
    })),
  );
  const view = game === null ? null : playViewOfGame(game, lastTapOf(actions));
  const [overlay, setOverlay] = useState<PlayOverlay>(() =>
    initialOverlayOf(level, hasSavedSession),
  );
  const [pending, setPending] = useState<PendingOverlay | null>(null);
  const [isFlagMode, setIsFlagMode] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<Attempt | null>(null);
  const [earnShortBy, setEarnShortBy] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isBombLoss, setIsBombLoss] = useState(false);
  const guides = usePlayGuides({
    view,
    cardsBefore: level === null ? [] : levelCardIds(level),
    tutorialKey: null,
    movesHintKey: null,
  });
  const isPlaying = () => useGameSessionStore.getState().game?.status === "playing";
  usePlayInterrupts({ pending, isPlaying, setOverlay, setPending });

  // Before the first paint, so the board never shows the previous level (до первой отрисовки, чтобы поле не показало прошлый уровень).
  useLayoutEffect(() => {
    if (level === null) return;
    if (!hasSavedSession) finishLostGame();
    useGameSessionStore.getState().start(level, hasSavedSession ? "resume" : "new");
    unlockTapInput();
  }, [level, hasSavedSession]);

  const exit = () => {
    finishLostGame();
    if (router.canGoBack()) router.back();
    else router.replace(DAILY_ROUTE);
  };

  const restart = () => {
    if (level === null) return;
    if (isCountedDailyInPlay()) finishAttempt();
    else finishLostGame();
    useGameSessionStore.getState().start(level, "new");
    unlockTapInput();
    setPending(null);
    setIsFlagMode(false);
    setOverlay("none");
  };

  const handleCellPress = (cell: Idx) => {
    const current = useGameSessionStore.getState().game;
    if (current === null || current.status !== "playing" || overlay !== "none") return;
    if (!guides.allowsTap(cell)) return;
    if (isFlagMode && !current.revealed.has(cell)) {
      flagCell(cell);
      return;
    }

    const events = tapCell(cell);
    fx.play(cell, events);
    if (hasEvent(events, "targetFound")) {
      AccessibilityInfo.announceForAccessibility(t("play.found"));
    }
    if (hasEvent(events, "win")) {
      setLastAttempt(finishAttempt());
      setPending({ overlay: "win", delay: motion.animation.targetFound });
    }
    if (hasEvent(events, "lose")) {
      const isBomb = hasEvent(events, "bomb");
      setIsBombLoss(isBomb);
      setPending({ overlay: "lose", delay: isBomb ? motion.animation.bomb : 0 });
    }
  };

  return {
    play,
    view,
    flags,
    guides,
    isCountedRestart: overlay === "restartConfirm" && isCountedDailyInPlay(),
    canContinue: game !== null && canContinue(game),
    fx,
    overlay,
    isFlagMode,
    lastAttempt,
    isBombLoss,
    earnShortBy,
    toast,
    handleCellPress,
    handleCellLongPress: (cell: Idx) => {
      if (overlay === "none" && isPlaying() && !guides.isBlocking) flagCell(cell);
    },
    handleToggleFlagMode: () => setIsFlagMode((value) => !value),
    handlePause: () => setOverlay("pause"),
    handleResume: () => setOverlay(game?.status === "lost" ? "lose" : "none"),
    handleRestartRequest: () => {
      if (game !== null && game.movesUsed > 0 && game.status === "playing")
        setOverlay("restartConfirm");
      else restart();
    },
    handleRestart: restart,
    handleContinued: () => setOverlay("none"),
    handleDecline: () => setOverlay("declined"),
    handleExit: exit,
    handleHome: () => router.replace("/"),
    handleShortOfEmeralds: setEarnShortBy,
    handleEarnClose: () => setEarnShortBy(null),
    handleEarnDaily: () => {
      setEarnShortBy(null);
      router.push(DAILY_ROUTE);
    },
    handleContinueError: (messageKey: AdMessageKey) =>
      setToast((current) => ({ id: (current?.id ?? 0) + 1, text: t(messageKey) })),
    handleToastHide: () => setToast(null),
    handleRules: () => {
      setOverlay("none");
      guides.handleRulesOpen();
    },
  };
};
