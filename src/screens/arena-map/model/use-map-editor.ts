import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { toCell, toIdx } from "@reckon-path/engine";
import type { Idx } from "@reckon-path/engine";

import { useArenaQuery } from "@entities/arena";
import {
  addFence,
  checkEditorMap,
  countElements,
  emptyMap,
  isMapEmpty,
  isSessionDirty,
  limitsOf,
  NEW_MAP_ID,
  paintCell,
  toggleCell,
  toggleFence,
  useArenaMapsQuery,
  useEditorStore,
} from "@entities/arena-map";
import type { CellTool, EditRefusal, EditResult } from "@entities/arena-map";
import { useRandomArenaMap } from "@features/random-arena-map";
import { useSaveArenaMap } from "@features/save-arena-map";
import { useIsOnline } from "@shared/api";
import { useBoardFx } from "@widgets/board";

import { nextMapNumber } from "./next-map-name";
import { statusTextOf } from "./status-text";
import { useBotCheck } from "./use-bot-check";

export type EditorTool = CellTool | "fence";
export type EditorDialog = "random" | "exit" | "rename" | null;

const PAINT_TOOLS: ReadonlySet<EditorTool> = new Set(["stream", "rock", "erase"]);

export const useMapEditor = (id: string, onToast: (text: string) => void) => {
  const { t } = useTranslation();
  const arena = useArenaQuery();
  const maps = useArenaMapsQuery();
  const isOnline = useIsOnline();
  const fx = useBoardFx();
  const session = useEditorStore((state) => state.session);
  const strokeBase = useEditorStore((state) => state.strokeBase);
  const [tool, setTool] = useState<EditorTool>("target");
  const [dialog, setDialog] = useState<EditorDialog>(null);
  const [flash, setFlash] = useState({ tool: null as EditorTool | null, key: 0 });
  const [isLeavingAfterSave, setIsLeavingAfterSave] = useState(false);
  // A new map keeps editing under the id the server gave it (новая карта продолжает редактироваться под id, выданным сервером).
  const [savedNewId, setSavedNewId] = useState<string | null>(null);
  const mapId = savedNewId ?? id;
  const [hasLeft, setHasLeft] = useState(false);
  const check = useBotCheck();
  const format = arena.data?.format;
  const existing = maps.data?.find((map) => map.id === mapId);
  const formatMaps = (maps.data ?? []).filter((map) => map.format === format?.size);
  const nameOf = (n: number) => t("map.defaultName", { n });

  useEffect(() => {
    if (format === undefined || hasLeft) return;
    if (mapId === NEW_MAP_ID) {
      const name = nameOf(
        nextMapNumber(
          formatMaps.map((map) => map.name),
          nameOf,
        ),
      );
      useEditorStore.getState().open(mapId, { name, map: emptyMap(format.size) }, null);
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

  const saving = useSaveArenaMap({
    onSaved: (savedId) => {
      useEditorStore.getState().markSaved(savedId);
      setSavedNewId(savedId);
    },
    onActivated: () => {
      onToast(t("map.saved"));
      if (isLeavingAfterSave) leave();
    },
    onDraft: () => {
      onToast(t("map.draft"));
      if (isLeavingAfterSave) leave();
    },
    onMapsLimit: () => {
      setIsLeavingAfterSave(false);
      onToast(t("map.mapsLimit"));
    },
    onError: (messageKey) => {
      setIsLeavingAfterSave(false);
      onToast(t(messageKey));
    },
  });
  const random = useRandomArenaMap({
    onMap: (map) => useEditorStore.getState().apply(map),
    onError: (messageKey) => onToast(t(messageKey)),
  });

  if (format === undefined || session === null || session.mapId !== mapId) {
    const isMissing = id !== NEW_MAP_ID && maps.data !== undefined && existing === undefined;
    return {
      isReady: false as const,
      isPending: arena.isPending || maps.isPending,
      isFailed: arena.isError || maps.isError || isMissing,
      handleRetry: () => {
        void arena.refetch();
        void maps.refetch();
      },
      handleLeave: () => router.back(),
    };
  }

  const { map } = session;
  // The norm runs a solver, so a drag keeps the status of the map it started from (норма запускает решатель, поэтому протяжка держит статус карты, с которой началась).
  const status = checkEditorMap(strokeBase ?? map, format);
  const errorCells = "cells" in status ? status.cells.map((cell) => toIdx(map.cols, cell)) : [];
  const needInternet = () => onToast(t("arena.needInternet"));
  const isDirty = isSessionDirty(session);

  const refuse = (refusal: EditRefusal, idx: Idx | null) => {
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

  const save = () =>
    saving.save(mapId === NEW_MAP_ID ? null : mapId, {
      name: session.name,
      format: format.size,
      map,
    });

  return {
    isReady: true as const,
    session,
    format,
    profile: arena.data?.profile,
    tool,
    gesture: tool === "fence" ? ("edge" as const) : ("cell" as const),
    counts: countElements(map),
    limits: limitsOf(format, map),
    flash,
    status,
    statusText: statusTextOf(status, t),
    errorCells,
    check,
    fx,
    dialog,
    isDirty,
    isOnline,
    isSaving: saving.isPending,
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
      const edit = index === 0 ? toggleCell : paintCell;
      commit(edit(current, format, tool, [row, col]), idx);
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
      useEditorStore.getState().apply(emptyMap(format.size));
    },
    handleRandom: () => {
      if (!isOnline) needInternet();
      else if (isMapEmpty(map)) random.requestRandom(format.size);
      else setDialog("random");
    },
    handleRandomConfirm: () => {
      setDialog(null);
      check.stop();
      random.requestRandom(format.size);
    },
    handleCheck: () => check.start(map),
    handleSave: save,
    handleBack: () => {
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
      setIsLeavingAfterSave(true);
      save();
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
