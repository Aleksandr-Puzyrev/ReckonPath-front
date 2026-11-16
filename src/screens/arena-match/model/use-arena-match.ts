import { useState } from "react";

import { toCell } from "@reckon-path/engine";
import type { Idx } from "@reckon-path/engine";

import { levelOfBoard, tapIdxOfBoard, tapsOfBoard, useMatchStore } from "@entities/match";
import type { MatchView } from "@entities/match";
import { useTapConfirm } from "@features/confirm-pvp-tap";
import { useBoardFx } from "@widgets/board";

import type { useMatchActions } from "./use-match-actions";

type MatchActions = ReturnType<typeof useMatchActions>;

export const useArenaMatch = (view: MatchView, actions: MatchActions) => {
  const flagCells = useMatchStore((state) => state.flags);
  const fx = useBoardFx();
  const [isFlagMode, setIsFlagMode] = useState(false);
  const { rivalMap, myMap } = view;
  const cols = rivalMap?.cols ?? 0;
  const taps = rivalMap === undefined ? [] : tapsOfBoard(rivalMap);
  const isMyTurn = view.kind === "map" || view.turn === "me";
  // Input waits for the answer of the last tap, so no double move leaves (ввод ждёт ответа на прошлый тап, чтобы не ушёл двойной ход).
  const canTap = view.status === "play" && isMyTurn && !actions.isTapPending;
  const confirm = useTapConfirm(canTap && !isFlagMode ? String(view.seq) : null);
  const isRevealed = (idx: Idx) => taps.some(({ cell }) => cell === idx);

  const toggleFlag = (idx: Idx) => {
    if (isRevealed(idx)) return;
    const [row, col] = toCell(cols, idx);
    useMatchStore.getState().toggleFlag([row, col]);
  };

  return {
    fx,
    isFlagMode,
    isMyTurn,
    layout: rivalMap === undefined ? null : levelOfBoard(rivalMap),
    taps,
    flags: flagCells.map(([row, col]) => row * cols + col),
    pendingCell: confirm.selected,
    isDimmed: !canTap,
    myLevel: myMap === undefined ? null : levelOfBoard(myMap),
    myMapTaps: myMap === undefined ? [] : tapIdxOfBoard(myMap),
    handleCellPress: (idx: Idx) => {
      if (isFlagMode) {
        toggleFlag(idx);
        return;
      }
      if (!canTap || isRevealed(idx) || !confirm.shouldSend(idx)) return;
      const [row, col] = toCell(cols, idx);
      actions.tap(view, row, col);
    },
    handleCellLongPress: toggleFlag,
    handleFlagMode: () => setIsFlagMode((current) => !current),
  };
};
