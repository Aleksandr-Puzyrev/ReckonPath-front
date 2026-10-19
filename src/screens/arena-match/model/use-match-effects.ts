import { router } from "expo-router";
import { useEffect, useEffectEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUnistyles } from "react-native-unistyles";

import { matchSession } from "@entities/match";
import type { MatchEmote, MatchEvent, MatchPhase } from "@entities/match";
import { haptic } from "@shared/haptics";
import type { HapticKind } from "@shared/haptics";

type ToastKey =
  | "match.toast.myBomb"
  | "match.toast.opponentBomb"
  | "match.toast.opponentFound"
  | "match.toast.finalForMe"
  | "match.toast.finalForOpponent";

const LAST_TIMEOUT = 2;

const HAPTICS: Partial<Record<MatchEvent["kind"], HapticKind[]>> = {
  myTurn: ["light"],
  targetFound: ["success"],
  myBomb: ["heavy", "error"],
  opponentFound: ["medium"],
  opponentBomb: ["success"],
  timeout: ["warning"],
};

const TOASTS: Partial<Record<MatchEvent["kind"], ToastKey>> = {
  myBomb: "match.toast.myBomb",
  opponentBomb: "match.toast.opponentBomb",
  opponentFound: "match.toast.opponentFound",
  finalForMe: "match.toast.finalForMe",
  finalForOpponent: "match.toast.finalForOpponent",
};

interface EffectsInput {
  event: MatchEvent | null;
  emote: MatchEmote | null;
  emoteId: number;
  isMuted: boolean;
  phase: MatchPhase;
  onToast: (text: string) => void;
}

export const useMatchEffects = ({
  event,
  emote,
  emoteId,
  isMuted,
  phase,
  onToast,
}: EffectsInput) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const [hiddenEmoteId, setHiddenEmoteId] = useState(0);

  // An effect event reads the latest callbacks, so a re-rendered parent does not replay the event (событие эффекта читает свежие колбэки, поэтому перерисовка родителя не повторяет событие).
  const announce = useEffectEvent(({ kind, count }: MatchEvent) => {
    const kinds = HAPTICS[kind];
    if (kinds !== undefined) haptic(...kinds);
    if (kind === "timeout") {
      const text = t("match.timeout", { n: count });
      onToast(count === LAST_TIMEOUT ? `${text}. ${t("match.timeoutWarn")}` : text);
    }
    const toast = TOASTS[kind];
    if (toast !== undefined) onToast(t(toast));
  });

  useEffect(() => {
    if (event !== null) announce(event);
  }, [event]);

  useEffect(() => {
    if (emoteId === 0) return undefined;
    const timer = setTimeout(() => setHiddenEmoteId(emoteId), theme.motion.toast.duration);
    return () => clearTimeout(timer);
  }, [emoteId, theme.motion.toast.duration]);

  const leaveLost = useEffectEvent(() => {
    onToast(t("errors.NETWORK"));
    matchSession.leave();
    router.back();
  });

  useEffect(() => {
    if (phase === "lost") leaveLost();
  }, [phase]);

  const isShown = emote !== null && emoteId !== hiddenEmoteId;
  return { bubble: isShown && !(emote.player === "opponent" && isMuted) ? emote : null };
};
