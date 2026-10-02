import { router } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AccessibilityInfo, AppState, BackHandler } from "react-native";

import type { GameEvent, Idx } from "@reckon-path/engine";

import { TUTORIAL } from "@reckon-path/content";

import {
  CAMPAIGN_LEVELS,
  CAMPAIGN_WORLDS,
  findCampaignLevel,
  nextCampaignLevel,
  selectHasSavedSession,
  useGameSessionStore,
} from "@entities/level";
import { currentLevelId, levelStateOf, useProgressStore } from "@entities/progress";
import { useRulesStore } from "@entities/rules";
import { flagCell } from "@features/flag-cell";
import { tapCell, unlockTapInput } from "@features/tap-cell";
import { motion } from "@shared/theme";
import { useBoardFx } from "@widgets/board";

import { usePlayGuides } from "./use-play-guides";

export type PlayOverlay =
  "none" | "resume" | "pause" | "restartConfirm" | "win" | "lose" | "declined";

interface PendingOverlay {
  overlay: PlayOverlay;
  delay: number;
}

const CAMPAIGN_MODE = "campaign";
const LEVELS_ROUTE = "/levels";

const NO_STATE_CHANGE: ReadonlySet<GameEvent["type"]> = new Set(["blocked", "alreadyRevealed"]);

const hasEvent = (events: readonly GameEvent[], type: GameEvent["type"]) =>
  events.some((event) => event.type === type);

const exitToLevels = () => {
  // Leaving a lost game ends the attempt, so it is not offered again (выход из проигранной партии завершает попытку, и её больше не предлагают продолжить).
  const session = useGameSessionStore.getState();
  if (session.game?.status === "lost") session.finish();
  if (router.canGoBack()) router.back();
  else router.replace(LEVELS_ROUTE);
};

export const usePlayScreen = (mode: string, id: string) => {
  const { t } = useTranslation();
  const campaign = mode === CAMPAIGN_MODE ? findCampaignLevel(id) : null;
  const next = campaign === null ? null : nextCampaignLevel(id);
  const fx = useBoardFx();
  const level = campaign?.level ?? null;
  // A locked level can still be reached by a link; it is checked once, so winning it does not flip the screen (закрытый уровень можно открыть по ссылке; проверка один раз, чтобы победа не переключала экран).
  const [lockedBy] = useState(() => {
    if (level === null) return null;
    const { best } = useProgressStore.getState();
    const currentId = currentLevelId(CAMPAIGN_WORLDS, best);
    if (levelStateOf(level.id, currentId, best) !== "locked") return null;
    return (
      CAMPAIGN_LEVELS.find((campaignLevel) => campaignLevel.level.id === currentId)?.number ?? null
    );
  });
  // The tutorial always starts fresh, even over a saved game (обучение всегда начинается заново, даже поверх сохранённой партии).
  const [hasSavedSession] = useState(
    () =>
      level !== null &&
      !(level.id === TUTORIAL.levelId && useRulesStore.getState().tutorial === "pending") &&
      selectHasSavedSession(level.id)(useGameSessionStore.getState()),
  );
  const guides = usePlayGuides(lockedBy === null ? level : null);
  const [overlay, setOverlay] = useState<PlayOverlay>(hasSavedSession ? "resume" : "none");
  const [pending, setPending] = useState<PendingOverlay | null>(null);
  const [isFlagMode, setIsFlagMode] = useState(false);
  const [isRecord, setIsRecord] = useState(false);
  const [isBombLoss, setIsBombLoss] = useState(false);

  // Before the first paint, so the board never shows the previous level (до первой отрисовки, чтобы поле не показало прошлый уровень).
  useLayoutEffect(() => {
    if (level === null || lockedBy !== null) return;
    useGameSessionStore.getState().start(level, hasSavedSession ? "resume" : "new");
    unlockTapInput();
  }, [level, hasSavedSession, lockedBy]);

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

  const restart = () => {
    if (level === null) return;
    useGameSessionStore.getState().start(level, "new");
    unlockTapInput();
    setPending(null);
    setIsFlagMode(false);
    setOverlay("none");
  };

  const handleCellPress = (cell: Idx) => {
    const { game } = useGameSessionStore.getState();
    if (game === null || game.status !== "playing" || overlay !== "none") return;
    if (!guides.allowsTap(cell)) return;
    if (isFlagMode && !game.revealed.has(cell)) {
      flagCell(cell);
      return;
    }

    const outcome = tapCell(cell);
    fx.play(cell, outcome.events);
    if (
      guides.tutorialStep !== null &&
      outcome.events.some(({ type }) => !NO_STATE_CHANGE.has(type))
    ) {
      guides.handleTutorialTap();
    }
    if (hasEvent(outcome.events, "targetFound")) {
      AccessibilityInfo.announceForAccessibility(t("play.found"));
    }
    if (hasEvent(outcome.events, "win")) {
      guides.handleTutorialWin();
      setIsRecord(outcome.isRecord);
      setPending({ overlay: "win", delay: motion.animation.targetFound });
    }
    if (hasEvent(outcome.events, "lose")) {
      const isBomb = hasEvent(outcome.events, "bomb");
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
    else restart();
  };

  const resume = () => {
    const { game } = useGameSessionStore.getState();
    setOverlay(game?.status === "lost" ? "lose" : "none");
  };

  const goNext = () => {
    if (next === null) return;
    router.replace({
      pathname: "/play/[mode]/[id]",
      params: { mode: CAMPAIGN_MODE, id: next.level.id },
    });
  };

  const skipTutorial = () => {
    guides.handleTutorialSkip();
    useGameSessionStore.getState().finish();
    router.replace(LEVELS_ROUTE);
  };

  return {
    campaign,
    guides,
    lockedBy,
    hasNext: next !== null,
    fx,
    overlay,
    isFlagMode,
    isRecord,
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
    handleExit: exitToLevels,
    handleTutorialSkip: skipTutorial,
    handleRules: () => {
      setOverlay("none");
      guides.handleRulesOpen();
    },
  };
};
