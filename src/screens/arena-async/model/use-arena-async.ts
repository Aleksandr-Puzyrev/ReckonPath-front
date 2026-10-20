import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { applyTrophies, toCell, toIdx, trophyDelta } from "@reckon-path/engine";
import type { Idx } from "@reckon-path/engine";

import {
  isAsyncFinish,
  layoutLevelOf,
  surrenderAsyncMatchMutationOptions,
  tapAsyncMatchMutationOptions,
  useAsyncMatchStore,
} from "@entities/match";
import { errorMessageKey } from "@shared/api";
import { haptic } from "@shared/haptics";
import { useBoardFx } from "@widgets/board";

export const useArenaAsync = (onToast: (text: string) => void) => {
  const { t } = useTranslation();
  const fx = useBoardFx();
  const game = useAsyncMatchStore(useShallow((state) => state));
  const [isFlagMode, setIsFlagMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSurrenderOpen, setIsSurrenderOpen] = useState(false);
  const { match, finish } = game;
  const size = match?.map.rows ?? 0;
  const asyncId = match?.asyncId ?? null;
  const isRevealed = (idx: Idx) => game.taps.some(({ cell }) => toIdx(size, cell) === idx);

  const tap = useMutation({
    ...tapAsyncMatchMutationOptions(),
    onSuccess: (answer, { cell }) => {
      if (isAsyncFinish(answer)) {
        useAsyncMatchStore.getState().receiveFinish(answer, cell);
        return;
      }
      useAsyncMatchStore.getState().receiveTap(cell, answer);
      if (answer.outcome === "bomb") {
        haptic("heavy", "error");
        onToast(t("async.bomb"));
      }
      if (answer.outcome === "target") haptic("success");
    },
    onError: (error) => {
      useAsyncMatchStore.getState().setPendingCell(null);
      onToast(t(errorMessageKey(error)));
    },
  });
  const surrender = useMutation({
    ...surrenderAsyncMatchMutationOptions(),
    onSuccess: (answer) => useAsyncMatchStore.getState().receiveFinish(answer, null),
    onError: (error) => onToast(t(errorMessageKey(error))),
  });

  useEffect(() => {
    if (finish === null || asyncId === null) return;
    router.replace({ pathname: "/arena/result/[id]", params: { id: asyncId, mode: "async" } });
  }, [finish, asyncId]);

  const toggleFlag = (idx: Idx) => {
    const [row, col] = toCell(size, idx);
    if (!isRevealed(idx)) game.toggleFlag([row, col]);
  };

  const myTrophies = game.trophiesBefore;
  const loss = trophyDelta({
    myTrophies,
    opponentTrophies: myTrophies,
    outcome: "loss",
    kind: "async",
  });

  return {
    fx,
    match,
    layout: match === null ? null : layoutLevelOf(match.map, size),
    taps: game.taps.map(({ cell, outcome, value, bombNear }) => ({
      cell: toIdx(size, cell),
      outcome,
      value,
      bombNear,
    })),
    flags: game.flags.map((cell) => toIdx(size, cell)),
    pendingCell: game.pendingCell === null ? null : toIdx(size, game.pendingCell),
    found: game.taps.filter(({ outcome }) => outcome === "target").length,
    turnsUsed: game.turnsUsed,
    deadline: game.deadline,
    isFlagMode,
    isMenuOpen,
    isSurrenderOpen,
    surrenderLoss: myTrophies - applyTrophies(myTrophies, loss, 0),
    handleCellPress: (idx: Idx) => {
      if (isFlagMode) {
        toggleFlag(idx);
        return;
      }
      if (asyncId === null || game.pendingCell !== null || isRevealed(idx) || finish !== null)
        return;
      const [row, col] = toCell(size, idx);
      game.setPendingCell([row, col]);
      tap.mutate({ id: asyncId, turn: game.turnsUsed + 1, cell: [row, col] });
    },
    handleCellLongPress: toggleFlag,
    handleFlagMode: () => setIsFlagMode((current) => !current),
    handleMenu: setIsMenuOpen,
    handleSurrenderOpen: () => {
      setIsMenuOpen(false);
      setIsSurrenderOpen(true);
    },
    handleSurrenderClose: () => setIsSurrenderOpen(false),
    handleSurrender: () => {
      setIsSurrenderOpen(false);
      if (asyncId !== null) surrender.mutate(asyncId);
    },
  };
};
