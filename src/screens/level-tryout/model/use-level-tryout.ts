import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { applyTap } from "@reckon-path/engine";
import type { GameState, Idx } from "@reckon-path/engine";

import { customLevelTitleOf, useTryoutBestStore } from "@entities/custom-level";
import { startGame } from "@entities/level";
import { useBoardFx } from "@widgets/board";

import { tryoutLevelOf } from "./tryout-source";

// Both games are kept here, apart from the campaign game: no rewards, stars or saved attempts (обе партии ведутся здесь, отдельно от партии кампании: без наград, звёзд и сохранённых попыток).
export const useLevelTryout = (code: string | undefined) => {
  const { i18n } = useTranslation();
  const fx = useBoardFx();
  const [source] = useState(() => tryoutLevelOf(code));
  const [game, setGame] = useState<GameState | null>(() =>
    source === null ? null : startGame(source.level),
  );
  const [lastCell, setLastCell] = useState<Idx | null>(null);
  const isAuthor = source?.isAuthor ?? true;

  return {
    title: source === null ? "" : customLevelTitleOf(source.level, i18n.language),
    game,
    lastCell,
    isAuthor,
    challenge: source?.challenge ?? null,
    fx,
    handleCellPress: (cell: Idx) => {
      if (source === null || game === null || game.status !== "playing") return;
      const { state, events } = applyTap(game, cell);
      fx.play(cell, events);
      setGame(state);
      setLastCell(cell);
      if (isAuthor && state.status === "won") {
        useTryoutBestStore.getState().record(source.levelCode, state.movesUsed);
      }
    },
    handleRestart: () => {
      if (source === null) return;
      setGame(startGame(source.level));
      setLastCell(null);
    },
    handleBack: () => router.back(),
    handleLevels: () => router.navigate("/levels"),
  };
};
