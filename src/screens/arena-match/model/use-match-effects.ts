import { router } from "expo-router";
import { useEffect, useEffectEvent, useState } from "react";
import { useTranslation } from "react-i18next";

import type { MatchView } from "@entities/match";
import { haptic } from "@shared/haptics";

interface EffectsInput {
  view: MatchView;
  maxTimeouts: number | null;
  onToast: (text: string) => void;
}

// The server keeps every event in the view; the screen reacts to the newest move and to the final turn once each (сервер держит всё во view; экран реагирует на новый ход и на финальный ход по одному разу).
export const useMatchEffects = ({ view, maxTimeouts, onToast }: EffectsInput) => {
  const { t } = useTranslation();
  const { last, final, turn, status, id } = view;
  const moveKey = last === undefined ? null : `${last.turn}:${last.by}:${last.kind}`;
  // The move the screen opened with is old news: only a move after mount is announced (ход, с которым открылся экран, уже не новость: объявляется только ход после монтирования).
  const [mountMoveKey] = useState(moveKey);

  const announceMove = useEffectEvent(() => {
    if (last === undefined) return;
    const isMine = last.by === "me";
    if (last.kind === "bomb") {
      haptic(...(isMine ? (["heavy", "error"] as const) : (["success"] as const)));
      onToast(t(isMine ? "match.toast.myBomb" : "match.toast.opponentBomb"));
      return;
    }
    if (last.kind === "target") {
      haptic(isMine ? "success" : "medium");
      if (!isMine) onToast(t("match.toast.opponentFound"));
      return;
    }
    if (last.kind !== "timeout" || !isMine) return;
    haptic("warning");
    const text = t("match.timeout", { n: view.me.timeouts });
    const isLastChance = maxTimeouts !== null && view.me.timeouts === maxTimeouts - 1;
    onToast(isLastChance ? `${text}. ${t("match.timeoutWarn")}` : text);
  });

  useEffect(() => {
    if (moveKey !== null && moveKey !== mountMoveKey) announceMove();
  }, [moveKey, mountMoveKey]);

  const announceFinal = useEffectEvent(() =>
    onToast(t(turn === "me" ? "match.toast.finalForMe" : "match.toast.finalForOpponent")),
  );

  useEffect(() => {
    if (final === true) announceFinal();
  }, [final]);

  useEffect(() => {
    if (turn === "me") haptic("light");
  }, [turn]);

  useEffect(() => {
    if (status === "done") router.replace({ pathname: "/arena/result/[id]", params: { id } });
  }, [status, id]);
};
