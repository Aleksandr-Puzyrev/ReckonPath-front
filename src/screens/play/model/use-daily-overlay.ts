import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { dailyGameKey } from "@entities/daily";
import type { DailyGame } from "@entities/daily";

import { usePlayInterrupts } from "./use-play-interrupts";
import type { PendingOverlay, PlayOverlay } from "./use-play-interrupts";

const overlayOf = (status: DailyGame["status"]): PlayOverlay => {
  if (status === "won") return "win";
  if (status === "lost") return "lose";
  return "none";
};

// A finished game shows its result at once, also when the server finished it without this tap: another device or a stale tap (законченная партия сразу показывает итог, и когда сервер закончил её без этого тапа: другое устройство или устаревший тап).
export const useDailyOverlay = (game: DailyGame) => {
  const queryClient = useQueryClient();
  const [overlay, setOverlay] = useState<PlayOverlay>(() => overlayOf(game.status));
  const [pending, setPending] = useState<PendingOverlay | null>(null);
  const [shownStatus, setShownStatus] = useState(game.status);
  const isPlaying = () => queryClient.getQueryData(dailyGameKey(game.id))?.status === "play";
  usePlayInterrupts({ pending, isPlaying, setOverlay, setPending });

  if (game.status !== shownStatus) {
    setShownStatus(game.status);
    if (pending === null && overlay === "none") setOverlay(overlayOf(game.status));
  }

  return { overlay, setOverlay, setPending };
};
