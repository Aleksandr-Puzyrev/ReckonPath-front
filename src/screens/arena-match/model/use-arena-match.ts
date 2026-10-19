import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { toCell, toIdx } from "@reckon-path/engine";
import type { Idx } from "@reckon-path/engine";

import { useArenaQuery } from "@entities/arena";
import { useArenaMapsQuery } from "@entities/arena-map";
import { layoutLevelOf, matchSession, useMatchStore } from "@entities/match";
import type { MatchTap } from "@entities/match";
import { useMeQuery } from "@entities/wallet";
import { useBoardFx } from "@widgets/board";
import type { RemoteTap } from "@widgets/board";

import { bannerTextOf } from "./banner-text";
import { surrenderLoss } from "./surrender-loss";

export type MatchSheet = "emotes" | "menu" | null;

const remoteOf =
  (size: number) =>
  ({ cell, outcome, value, bombNear }: MatchTap): RemoteTap => ({
    cell: toIdx(size, cell),
    outcome,
    value,
    bombNear,
  });

export const useArenaMatch = () => {
  const { t } = useTranslation();
  const match = useMatchStore(useShallow((state) => state));
  const arena = useArenaQuery();
  const maps = useArenaMapsQuery();
  const { data: me } = useMeQuery();
  const fx = useBoardFx();
  const [isFlagMode, setIsFlagMode] = useState(false);
  const [sheet, setSheet] = useState<MatchSheet>(null);
  const [isSurrenderOpen, setIsSurrenderOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const size = match.format?.size ?? 0;
  const myMap = maps.data?.find(({ id }) => id === arena.data?.activeMapId) ?? null;
  const myTrophies = arena.data?.profile.trophies ?? 0;
  const canTap =
    match.current === "me" &&
    (match.phase === "myTurn" || match.phase === "finalTurn") &&
    match.pendingCell === null;
  const isRevealed = (idx: Idx) => match.myTaps.some((tap) => toIdx(size, tap.cell) === idx);

  const toggleFlag = (idx: Idx) => {
    const [row, col] = toCell(size, idx);
    match.toggleFlag([row, col]);
  };

  return {
    match,
    me,
    profile: arena.data?.profile,
    myMap,
    fx,
    isFlagMode,
    sheet,
    isSurrenderOpen,
    isMuted,
    layout: match.layout === null ? null : layoutLevelOf(match.layout, size),
    myTaps: match.myTaps.map(remoteOf(size)),
    opponentTaps: match.opponentTaps.map(({ cell }) => toIdx(size, cell)),
    flags: match.flags.map((cell) => toIdx(size, cell)),
    pendingCell: match.pendingCell === null ? null : toIdx(size, match.pendingCell),
    isDimmed: match.current !== "me",
    banner: bannerTextOf(match.phase, match.current, match.skipped, t),
    surrenderLoss: match.opponent === null ? 0 : surrenderLoss(myTrophies, match.opponent),
    handleCellPress: (idx: Idx) => {
      if (isFlagMode) {
        if (!isRevealed(idx)) toggleFlag(idx);
        return;
      }
      if (!canTap || isRevealed(idx)) return;
      const [row, col] = toCell(size, idx);
      matchSession.tap([row, col]);
    },
    handleCellLongPress: (idx: Idx) => {
      if (!isRevealed(idx)) toggleFlag(idx);
    },
    handleFlagMode: () => setIsFlagMode((current) => !current),
    handleSheet: setSheet,
    handleEmote: (emote: Parameters<typeof matchSession.emote>[0]) => {
      setSheet(null);
      matchSession.emote(emote);
    },
    handleMuteToggle: () => setIsMuted((current) => !current),
    handleSurrenderOpen: () => {
      setSheet(null);
      setIsSurrenderOpen(true);
    },
    handleSurrender: () => {
      setIsSurrenderOpen(false);
      matchSession.surrender();
    },
    handleSurrenderClose: () => setIsSurrenderOpen(false),
    handleLeave: () => {
      matchSession.leave();
      router.back();
    },
  };
};
