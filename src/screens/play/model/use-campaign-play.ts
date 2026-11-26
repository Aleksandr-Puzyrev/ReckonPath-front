import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AccessibilityInfo } from "react-native";
import { uuidv7 } from "uuidv7";

import type { GameEvent, Idx } from "@reckon-path/engine";

import type { AdMessageKey } from "@entities/ad";
import {
  campaignGameKey,
  giveUpCampaignGameMutationOptions,
  invalidateCampaignProgress,
  playViewOfCampaignGame,
  selectCampaignFlags,
  useCampaignFlagsStore,
} from "@entities/level";
import type { CampaignGame, CampaignLevel } from "@entities/level";
import { offerLinkAfterLevel } from "@features/link-account";
import { useInterstitial } from "@features/show-interstitial";
import { hapticsForEvents, useTapCampaignCell } from "@features/tap-cell";
import { errorMessageKey } from "@shared/api";
import { haptic } from "@shared/haptics";
import { motion } from "@shared/theme";
import type { ToastMessage } from "@shared/ui/toast";
import { useBoardFx } from "@widgets/board";

import { campaignGuideSource } from "./campaign-guide-source";
import { usePlayGuides } from "./use-play-guides";
import { usePlayInterrupts } from "./use-play-interrupts";
import type { PendingOverlay, PlayOverlay } from "./use-play-interrupts";

const LEVELS_ROUTE = "/levels";

interface CampaignPlayInput {
  level: CampaignLevel;
  game: CampaignGame;
  isResuming: boolean;
  onRestart: () => void;
}

const hasEvent = (events: readonly GameEvent[], type: GameEvent["type"]) =>
  events.some((event) => event.type === type);

// «Продолжить» on Home already chose to resume, so only a lost game still shows its sheet («Продолжить» на главной уже выбрал продолжение, поэтому лист остаётся только у проигранной партии).
const initialOverlayOf = (game: CampaignGame, isResuming: boolean): PlayOverlay => {
  if (game.status === "lost") return "lose";
  if (game.status === "abandoned") return "declined";
  return game.seq > 0 && !isResuming ? "resume" : "none";
};

export const useCampaignPlay = ({ level, game, isResuming, onRestart }: CampaignPlayInput) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const fx = useBoardFx();
  const view = playViewOfCampaignGame(game);
  const flags = useCampaignFlagsStore(selectCampaignFlags(game.id));
  const guides = usePlayGuides({ view, ...campaignGuideSource(level) });
  const interstitial = useInterstitial();
  const [overlay, setOverlay] = useState<PlayOverlay>(() => initialOverlayOf(game, isResuming));
  const [pending, setPending] = useState<PendingOverlay | null>(null);
  const [isFlagMode, setIsFlagMode] = useState(false);
  const [isBombLoss, setIsBombLoss] = useState(false);
  const [earnShortBy, setEarnShortBy] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const isLeavingRef = useRef(false);
  const showToast = (messageKey: AdMessageKey) =>
    setToast((current) => ({ id: (current?.id ?? 0) + 1, text: t(messageKey) }));
  const isPlaying = () => queryClient.getQueryData(campaignGameKey(game.id))?.status === "play";
  usePlayInterrupts({ pending, isPlaying, setOverlay, setPending });

  const handleTapped = (cell: Idx, events: GameEvent[]) => {
    fx.play(cell, events);
    if (guides.tutorialStep !== null) guides.handleTutorialTap();
    if (hasEvent(events, "targetFound")) {
      AccessibilityInfo.announceForAccessibility(t("play.found"));
    }
    if (hasEvent(events, "win")) {
      guides.handleTutorialWin();
      setPending({ overlay: "win", delay: motion.animation.targetFound });
    }
    if (hasEvent(events, "lose")) {
      const isBomb = hasEvent(events, "bomb");
      setIsBombLoss(isBomb);
      setPending({ overlay: "lose", delay: isBomb ? motion.animation.bomb : 0 });
    }
  };

  const tapper = useTapCampaignCell({ onTapped: handleTapped, onError: showToast });
  const giveUp = useMutation({
    ...giveUpCampaignGameMutationOptions(),
    networkMode: "always",
    onSuccess: (abandoned) => {
      queryClient.setQueryData(campaignGameKey(abandoned.id), abandoned);
      setOverlay("declined");
    },
    onError: (error) => showToast(errorMessageKey(error)),
  });

  // Leaving a result by any button may queue the link offer and show an interstitial first (уход с итога любой кнопкой может поставить в очередь предложение привязки и сначала показать межстраничную рекламу).
  const leaveResult = async () => {
    if (overlay === "win") offerLinkAfterLevel(level.number);
    if (guides.isTutorialLevel || (view.status !== "won" && view.status !== "lost")) return;
    interstitial.finishLevel();
    await interstitial.showIfDue();
  };

  // A second tap while an interstitial is coming must not navigate twice (повторный тап, пока идёт межстраничная реклама, не должен перейти второй раз).
  const once = (action: () => Promise<void> | void) => async () => {
    if (isLeavingRef.current) return;
    isLeavingRef.current = true;
    try {
      await leaveResult();
      await action();
    } finally {
      isLeavingRef.current = false;
    }
  };

  const exit = once(() => {
    void invalidateCampaignProgress(queryClient);
    if (router.canGoBack()) router.back();
    else router.replace(LEVELS_ROUTE);
  });

  const restart = once(() => {
    setPending(null);
    setIsFlagMode(false);
    setOverlay("none");
    onRestart();
  });

  const toggleFlag = (cell: Idx) => {
    if (view.revealed.has(cell) || view.board.kinds[cell] === "rock") return;
    useCampaignFlagsStore.getState().toggle(game.id, cell);
    haptic("selection");
  };

  const handleCellPress = (cell: Idx) => {
    if (overlay !== "none" || view.status !== "playing" || tapper.isPending) return;
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
    earnShortBy,
    toast,
    isTapFailed: tapper.isFailed,
    isTapPending: tapper.isPending,
    handleRetryTap: tapper.retry,
    handleCellPress,
    handleCellLongPress: (cell: Idx) => {
      const canFlag = overlay === "none" && view.status === "playing" && !guides.isBlocking;
      if (canFlag && guides.tutorialStep === null) toggleFlag(cell);
    },
    handleToggleFlagMode: () => setIsFlagMode((value) => !value),
    handlePause: () => setOverlay("pause"),
    handleResume: () => setOverlay(view.status === "lost" ? "lose" : "none"),
    handleRestartRequest: () => {
      if (view.movesUsed > 0 && view.status === "playing") setOverlay("restartConfirm");
      else void restart();
    },
    handleRestart: restart,
    handleContinued: () => setOverlay("none"),
    handleDecline: () => giveUp.mutate({ id: game.id, idempotencyKey: uuidv7() }),
    handleNext: once(() => {
      const next = game.result?.nextLevel;
      if (next === undefined) return;
      router.replace({
        pathname: "/play/[mode]/[id]",
        params: { mode: "campaign", id: String(next) },
      });
    }),
    handleExit: exit,
    handleShortOfEmeralds: setEarnShortBy,
    handleEarnClose: () => setEarnShortBy(null),
    handleEarnDaily: () => {
      setEarnShortBy(null);
      router.push("/daily");
    },
    handleContinueError: showToast,
    handleToastHide: () => setToast(null),
    handleTutorialSkip: () => {
      guides.handleTutorialSkip();
      router.replace(LEVELS_ROUTE);
    },
    handleRules: () => {
      setOverlay("none");
      guides.handleRulesOpen();
    },
  };
};
