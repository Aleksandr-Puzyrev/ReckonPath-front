import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";

import { toCell, toIdx } from "@reckon-path/engine";
import type { Idx } from "@reckon-path/engine";

import { useArenaQuery } from "@entities/arena";
import {
  addFence,
  checkEditorMap,
  countElements,
  DRAW_MAP_ID,
  emptyMap,
  isMapEmpty,
  isSessionDirty,
  limitsOf,
  NEW_MAP_ID,
  nextMapNumber,
  paintCell,
  statusOfProblem,
  toggleCell,
  toggleFence,
  gameLevelOfMap,
  TUTORIAL_MAP_ID,
  useArenaMapsQuery,
  useEditorStore,
} from "@entities/arena-map";
import type { CellTool, EditRefusal, EditResult } from "@entities/arena-map";
import { chooseMatchMapMutationOptions, useMatchStore } from "@entities/match";
import { useSeenGuides } from "@features/mark-guides-seen";
import { useRandomArenaMap } from "@features/random-arena-map";
import { useSaveArenaMap } from "@features/save-arena-map";
import { errorMessageKey, useIsOnline } from "@shared/api";
import { stepLabelOf } from "@widgets/arena-hero";
import { useBoardFx } from "@widgets/board";

import {
  TUTORIAL_BOMBS,
  tutorialHintKey,
  tutorialMapOf,
  tutorialRefusalKey,
} from "./editor-tutorial";
import { statusTextOf } from "./status-text";
import { useBotCheck } from "./use-bot-check";

export type EditorTool = CellTool | "fence";
export type EditorDialog = "random" | "exit" | "rename" | null;
export type ReadyMapEditor = Extract<ReturnType<typeof useMapEditor>, { isReady: true }>;

const PAINT_TOOLS: ReadonlySet<EditorTool> = new Set(["stream", "rock", "erase"]);

export const useMapEditor = (
  id: string,
  drawMatchId: string | null,
  onToast: (text: string) => void,
) => {
  const { t } = useTranslation();
  const arena = useArenaQuery();
  const maps = useArenaMapsQuery();
  const isOnline = useIsOnline();
  const fx = useBoardFx();
  const seen = useSeenGuides();
  const session = useEditorStore((state) => state.session);
  const strokeBase = useEditorStore((state) => state.strokeBase);
  const [tool, setTool] = useState<EditorTool>("target");
  const [dialog, setDialog] = useState<EditorDialog>(null);
  const [flash, setFlash] = useState({ tool: null as EditorTool | null, key: 0 });
  // A new map keeps editing under the id the server gave it (новая карта продолжает редактироваться под id, выданным сервером).
  const [savedNewId, setSavedNewId] = useState<string | null>(null);
  const mapId = savedNewId ?? id;
  const isTutorial = id === TUTORIAL_MAP_ID;
  const isDraw = id === DRAW_MAP_ID;
  const [hasLeft, setHasLeft] = useState(false);
  const check = useBotCheck((messageKey) => onToast(t(messageKey)));
  const matchView = useMatchStore((state) => state.view);
  const drawMatch =
    isDraw && matchView?.id === drawMatchId && matchView.status === "prepare" ? matchView : null;
  const isDrawOver = isDraw && drawMatch === null;
  const hasClosedDrawRef = useRef(false);
  const format = maps.data?.format;
  const existing = maps.data?.maps.find((map) => map.id === mapId);
  const savedMaps = maps.data?.maps ?? [];
  const nameOf = (n: number) => t("map.defaultName", { n });

  useEffect(() => {
    if (format === undefined || hasLeft || isDrawOver) return;
    if (mapId === TUTORIAL_MAP_ID) {
      const tutorial = { name: t("map.tutorial.title"), map: tutorialMapOf(format) };
      useEditorStore.getState().open(mapId, tutorial, null);
      return;
    }
    if (mapId === NEW_MAP_ID || mapId === DRAW_MAP_ID) {
      const name = nameOf(
        nextMapNumber(
          savedMaps.map((map) => map.name),
          nameOf,
        ),
      );
      useEditorStore
        .getState()
        .open(mapId, { name, map: emptyMap(format.rows, format.cols) }, null);
      return;
    }
    if (existing === undefined) return;
    const saved = { name: existing.name, map: existing.map };
    useEditorStore.getState().open(mapId, saved, saved);
  });

  const leave = () => {
    setHasLeft(true);
    useEditorStore.getState().reset();
    router.back();
  };

  // At the prepare deadline the server picks a map by itself, so the drawing is over with the phase (на дедлайне подготовки сервер сам выбирает карту, поэтому рисование заканчивается вместе с фазой).
  useEffect(() => {
    if (!isDrawOver || hasLeft || hasClosedDrawRef.current) return;
    hasClosedDrawRef.current = true;
    useEditorStore.getState().reset();
    router.back();
  }, [isDrawOver, hasLeft]);

  const saving = useSaveArenaMap({
    onSaved: (savedId) => {
      useEditorStore.getState().markSaved(savedId);
      setSavedNewId(savedId);
    },
    onActivated: () => onToast(t("map.saved")),
    onDraft: () => onToast(t("map.draft")),
    onMapsLimit: () => onToast(t("map.mapsLimit")),
    onError: (messageKey) => onToast(t(messageKey)),
  });
  // A map drawn in the prepare phase goes to the match, not to the saved maps (карта, нарисованная на подготовке, уходит в матч, а не в сохранённые).
  const drawing = useMutation({
    ...chooseMatchMapMutationOptions(),
    onSuccess: (view) => {
      useMatchStore.getState().receive(view);
      leave();
    },
    onError: (error) => onToast(t(errorMessageKey(error))),
  });
  const random = useRandomArenaMap({
    onMap: (map) => useEditorStore.getState().apply(map),
    onError: (messageKey) => onToast(t(messageKey)),
  });

  if (format === undefined || session === null || session.mapId !== mapId) {
    const isMissing =
      id !== NEW_MAP_ID && !isDraw && maps.data !== undefined && existing === undefined;
    return {
      isReady: false as const,
      isPending: maps.isPending,
      isFailed: maps.isError || isMissing,
      handleRetry: () => {
        void arena.refetch();
        void maps.refetch();
      },
      handleLeave: () => router.back(),
    };
  }

  const { map } = session;
  // A drag keeps the status of the map it started from; a server check that found a problem wins over the live one (протяжка держит статус карты, с которой началась; проблема, найденная проверкой сервера, важнее живой проверки).
  const problem = check.check?.problem ?? null;
  const status =
    problem === null
      ? checkEditorMap(strokeBase ?? map, format)
      : statusOfProblem(problem, map, format);
  const errorCells = "cells" in status ? status.cells.map((cell) => toIdx(map.cols, cell)) : [];
  const needInternet = () => onToast(t("arena.needInternet"));
  const isDirty = isSessionDirty(session);
  const counts = countElements(map);
  const formatLimits = limitsOf(format, map);

  const refuse = (refusal: EditRefusal, idx: Idx | null) => {
    const tutorialKey = isTutorial ? tutorialRefusalKey(refusal, tool) : null;
    if (tutorialKey !== null) {
      if (idx !== null) fx.play(idx, [{ type: "blocked", cell: idx }]);
      onToast(t(tutorialKey, { max: formatLimits.bombs }));
      return;
    }
    if (refusal.kind === "limit") {
      setFlash((current) => ({ tool, key: current.key + 1 }));
      onToast(t("map.err.limit", { max: refusal.max }));
      return;
    }
    if (idx !== null) fx.play(idx, [{ type: "blocked", cell: idx }]);
    onToast(
      t(refusal.kind === "bridgeOffStream" ? "map.err.bridge" : `map.refuse.${refusal.kind}`),
    );
  };

  const commit = (result: EditResult, idx: Idx | null) => {
    if ("refusal" in result) refuse(result.refusal, idx);
    else useEditorStore.getState().strokeTo(result.map);
  };

  const isOverTutorialBombs = (current: typeof map, row: number, col: number) =>
    isTutorial &&
    tool === "bomb" &&
    countElements(current).bombs >= TUTORIAL_BOMBS &&
    !(current.bombs ?? []).some(([r, c]) => r === row && c === col);

  const isStream = (row: number, col: number) =>
    (map.streams ?? []).some(([r, c]) => r === row && c === col);

  const save = (onFinish?: () => void) => {
    if (isDraw) {
      if (drawMatch === null) leave();
      else
        drawing.mutate({
          id: drawMatch.id,
          source: { source: "draw", level: gameLevelOfMap(map) },
        });
      return;
    }
    saving.save(
      mapId === NEW_MAP_ID || mapId === TUTORIAL_MAP_ID ? null : mapId,
      session.name,
      map,
      onFinish,
    );
  };

  return {
    isReady: true as const,
    session,
    format,
    leagueLabel: arena.data === undefined ? "" : stepLabelOf(arena.data.league),
    tool,
    gesture: tool === "fence" ? ("edge" as const) : ("cell" as const),
    isTutorial,
    prepareDeadline: drawMatch?.deadline ?? null,
    tutorialHintKey: tutorialHintKey(counts, formatLimits.targets),
    counts,
    limits: isTutorial ? { ...formatLimits, bombs: TUTORIAL_BOMBS } : formatLimits,
    flash,
    status,
    statusText: statusTextOf(status, t),
    errorCells,
    check,
    fx,
    dialog,
    isDirty,
    isOnline,
    isSaving: saving.isPending || drawing.isPending,
    isRandomPending: random.isPending,
    handleToolSelect: setTool,
    handleStrokeStart: () => {
      check.stop();
      useEditorStore.getState().beginStroke();
    },
    handleStrokeCell: (idx: Idx, index: number) => {
      if (tool === "fence" || (index > 0 && !PAINT_TOOLS.has(tool))) return;
      const current = useEditorStore.getState().session?.map ?? map;
      const [row, col] = toCell(map.cols, idx);
      if (isOverTutorialBombs(current, row, col)) {
        refuse({ kind: "limit", max: TUTORIAL_BOMBS }, idx);
        return;
      }
      const edit = index === 0 ? toggleCell : paintCell;
      const result = edit(current, format, tool, [row, col]);
      commit(result, idx);
      if (isTutorial && tool === "target" && !("refusal" in result) && isStream(row, col)) {
        onToast(t("map.tutorial.streamTarget"));
      }
    },
    handleStrokeEdge: ([a, b]: [Idx, Idx], index: number) => {
      const current = useEditorStore.getState().session?.map ?? map;
      const [rowA, colA] = toCell(map.cols, a);
      const [rowB, colB] = toCell(map.cols, b);
      const edit = index === 0 ? toggleFence : addFence;
      commit(
        edit(current, format, [
          [rowA, colA],
          [rowB, colB],
        ]),
        null,
      );
    },
    handleStrokeEnd: () => useEditorStore.getState().endStroke(),
    handleUndo: () => {
      check.stop();
      useEditorStore.getState().undo();
    },
    handleRedo: () => {
      check.stop();
      useEditorStore.getState().redo();
    },
    handleClear: () => {
      check.stop();
      useEditorStore.getState().apply(emptyMap(format.rows, format.cols));
    },
    handleRandom: () => {
      if (!isOnline) needInternet();
      else if (isMapEmpty(map)) random.requestRandom();
      else setDialog("random");
    },
    handleRandomConfirm: () => {
      setDialog(null);
      check.stop();
      random.requestRandom();
    },
    handleCheck: () => {
      if (isOnline) check.start(map);
      else needInternet();
    },
    handleSave: () => {
      if (!isTutorial) save();
      else if (status.kind === "valid") {
        save(() => {
          seen.markArenaEditorSeen();
          leave();
        });
      }
    },
    handleBack: () => {
      if (isTutorial) return;
      if (dialog !== null) setDialog(null);
      else if (isDirty) setDialog("exit");
      else leave();
    },
    handleExitSave: () => {
      setDialog(null);
      if (!isOnline) {
        needInternet();
        return;
      }
      save(leave);
    },
    handleExitDiscard: () => {
      setDialog(null);
      leave();
    },
    handleRenameOpen: () => setDialog("rename"),
    handleRename: (name: string) => {
      setDialog(null);
      useEditorStore.getState().rename(name);
    },
    handleDialogClose: () => setDialog(null),
  };
};
