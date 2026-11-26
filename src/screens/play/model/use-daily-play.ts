import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AccessibilityInfo } from "react-native";

import type { GameEvent, Idx } from "@reckon-path/engine";

import { dailyLevelId } from "@entities/daily";
import type { DailyGame } from "@entities/daily";
import {
  levelOfPublicBoard,
  playViewOfServerGame,
  selectCampaignFlags,
  useCampaignFlagsStore,
} from "@entities/level";
import { levelCardIds } from "@entities/rules";
import { hapticsForEvents, useTapDailyCell } from "@features/tap-cell";
import type { ErrorMessageKey } from "@shared/api";
import { haptic } from "@shared/haptics";
import { motion } from "@shared/theme";
import type { ToastMessage } from "@shared/ui/toast";
import { useBoardFx } from "@widgets/board";

import { exitDaily } from "./exit-daily";
import { useDailyOverlay } from "./use-daily-overlay";
import { usePlayGuides } from "./use-play-guides";

interface DailyPlayInput {
  game: DailyGame;
  onRestart: () => void;
}

const hasEvent = (events: readonly GameEvent[], type: GameEvent["type"]) =>
  events.some((event) => event.type === type);

export const useDailyPlay = ({ game, onRestart }: DailyPlayInput) => {
  const { t } = useTranslation();
  const fx = useBoardFx();
  const levelId = dailyLevelId(game.date);
  const view = playViewOfServerGame(game, levelId);
  const flags = useCampaignFlagsStore(selectCampaignFlags(game.id));
  const [cardsBefore] = useState(() => levelCardIds(levelOfPublicBoard(game.board, levelId)));
  const guides = usePlayGuides({ view, cardsBefore, tutorialKey: null, movesHintKey: null });
  const { overlay, setOverlay, setPending } = useDailyOverlay(game);
  const [isFlagMode, setIsFlagMode] = useState(false);
  const [isBombLoss, setIsBombLoss] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (messageKey: ErrorMessageKey) =>
    setToast((current) => ({ id: (current?.id ?? 0) + 1, text: t(messageKey) }));

  const handleTapped = (cell: Idx, events: GameEvent[]) => {
    fx.play(cell, events);
    if (hasEvent(events, "targetFound")) {
      AccessibilityInfo.announceForAccessibility(t("play.found"));
    }
    if (hasEvent(events, "win"))
      setPending({ overlay: "win", delay: motion.animation.targetFound });
    if (hasEvent(events, "lose")) {
      const isBomb = hasEvent(events, "bomb");
      setIsBombLoss(isBomb);
      setPending({ overlay: "lose", delay: isBomb ? motion.animation.bomb : 0 });
    }
  };

  const tapper = useTapDailyCell({ onTapped: handleTapped, onError: showToast });

  const restart = () => {
    setPending(null);
    setIsFlagMode(false);
    setOverlay("none");
    onRestart();
  };

  const toggleFlag = (cell: Idx) => {
    if (view.revealed.has(cell) || view.board.kinds[cell] === "rock") return;
    useCampaignFlagsStore.getState().toggle(game.id, cell);
    haptic("selection");
  };

  const handleCellPress = (cell: Idx) => {
    if (overlay !== "none" || view.status !== "playing") return;
    if (tapper.isPending || tapper.isFailed) return;
    if (!guides.allowsTap(cell) || view.revealed.has(cell)) return;
    if (isFlagMode) {
      toggleFlag(cell);
      return;
    }
    if (view.board.kinds[cell] === "rock") {
      const blocked: GameEvent[] = [{ type: "blocked", cell }];
      fx.play(cell, blocked);
      haptic(...hapticsForEvents(blocked));
      return;
    }
    fx.tap(cell);
    tapper.tap(game, cell);
  };

  return {
    view,
    flags,
    guides,
    fx,
    overlay,
    isFlagMode,
    isBombLoss,
    toast,
    isTapFailed: tapper.isFailed,
    isTapPending: tapper.isPending,
    handleRetryTap: tapper.retry,
    handleCellPress,
    handleCellLongPress: (cell: Idx) => {
      if (overlay === "none" && view.status === "playing" && !guides.isBlocking) toggleFlag(cell);
    },
    handleToggleFlagMode: () => setIsFlagMode((value) => !value),
    handlePause: () => setOverlay("pause"),
    handleResume: () => setOverlay(view.status === "lost" ? "lose" : "none"),
    handleRestartRequest: () => {
      if (view.status === "won") return;
      if (view.movesUsed > 0 && view.status === "playing") setOverlay("restartConfirm");
      else restart();
    },
    handleRestart: restart,
    handleExit: exitDaily,
    handleHome: () => router.replace("/"),
    handleToastHide: () => setToast(null),
    handleRules: () => {
      setOverlay("none");
      guides.handleRulesOpen();
    },
  };
};
