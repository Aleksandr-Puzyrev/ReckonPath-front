import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { toCell, toIdx } from "@reckon-path/engine";
import type { Idx } from "@reckon-path/engine";

import { useSaveCustomLevel } from "@features/manage-custom-level";
import { addFence, toggleFence } from "@entities/arena-map";
import {
  checkCustomLevel,
  defaultMoveLimit,
  draftOfLevel,
  editFormatOf,
  emptyDraft,
  isDraftDirty,
  levelOfDraft,
  NEW_LEVEL_ID,
  NEW_LEVEL_SIZE,
  useCustomLevelsQuery,
  useLevelEditorStore,
} from "@entities/custom-level";
import type { CustomMap, CustomParams } from "@entities/custom-level";
import { useIsOnline } from "@shared/api";
import { useBoardFx } from "@widgets/board";

import { applyCellEdit } from "./apply-edit";
import type { LevelEditResult, LevelRefusal } from "./apply-edit";
import type { LevelEditorTool } from "./editor-tool";

export type LevelEditorDialog = "unsaved" | "share" | null;

export const useLevelEditor = (id: string, onToast: (text: string) => void) => {
  const { t } = useTranslation();
  const levels = useCustomLevelsQuery();
  const isOnline = useIsOnline();
  const fx = useBoardFx();
  const session = useLevelEditorStore((state) => state.session);
  const strokeBase = useLevelEditorStore((state) => state.strokeBase);
  const [tool, setTool] = useState<LevelEditorTool>("target");
  const [dialog, setDialog] = useState<LevelEditorDialog>(null);
  const [hasLeft, setHasLeft] = useState(false);
  const existing = levels.data?.find((entry) => entry.id === id);
  const newTitle = t("editor.defaultName", { n: (levels.data?.length ?? 0) + 1 });

  // A saved level opens from the server copy; a new one keeps the draft started in «Мои уровни», so a session that exists is never replaced by an empty one (сохранённый уровень открывается из серверной копии, новый — с черновика из «Моих уровней», поэтому существующая сессия не заменяется пустой).
  useEffect(() => {
    if (hasLeft) return;
    const store = useLevelEditorStore.getState();
    if (id === NEW_LEVEL_ID) {
      if (store.session !== null) return;
      store.open(id, emptyDraft(newTitle, NEW_LEVEL_SIZE, NEW_LEVEL_SIZE, "distance"), null);
      return;
    }
    if (existing === undefined) return;
    const draft = draftOfLevel(existing.level);
    store.open(id, draft, draft);
  }, [id, existing, hasLeft, newTitle]);

  const leave = () => {
    setHasLeft(true);
    useLevelEditorStore.getState().reset();
    router.back();
  };

  const saving = useSaveCustomLevel({
    onSaved: (savedId) => {
      useLevelEditorStore.getState().markSaved(savedId);
      onToast(t("editor.saved"));
      if (savedId !== id) router.setParams({ id: savedId });
    },
    onLimit: () => onToast(t("editor.limitReached")),
    onError: (messageKey) => onToast(t(messageKey)),
  });

  if (session === null || (session.levelId !== id && id !== NEW_LEVEL_ID)) {
    return {
      isReady: false as const,
      isPending: levels.isPending,
      isFailed: levels.isError || (levels.data !== undefined && existing === undefined),
      handleRetry: () => void levels.refetch(),
      handleLeave: () => router.back(),
    };
  }

  const { draft } = session;
  const { map } = draft;
  const savedId = session.levelId === NEW_LEVEL_ID ? null : session.levelId;
  // The norm runs a solver, so a drag keeps the status of the map it started from (норма запускает решатель, поэтому протяжка держит статус карты, с которой началась).
  const status = checkCustomLevel(
    strokeBase === null ? draft : { ...draft, map: strokeBase },
    savedId,
  );
  const norm = status.kind === "valid" ? status.norm : null;
  const moveLimit = draft.params.moveLimit ?? (norm === null ? null : defaultMoveLimit(norm));
  const errorCells = "cells" in status ? status.cells.map((cell) => toIdx(map.cols, cell)) : [];

  const refuse = (refusal: LevelRefusal, idx: Idx | null) => {
    if (refusal.kind === "limit") {
      onToast(t("map.err.limit", { max: refusal.max }));
      return;
    }
    if (idx !== null) fx.play(idx, [{ type: "blocked", cell: idx }]);
    if (refusal.kind === "bridgeOffStream") onToast(t("map.err.bridge"));
    else if (refusal.kind !== "onRock" && refusal.kind !== "onHidden") {
      onToast(t(`map.refuse.${refusal.kind}`));
    }
  };

  const commit = (result: LevelEditResult, idx: Idx | null) => {
    if ("refusal" in result) refuse(result.refusal, idx);
    else useLevelEditorStore.getState().strokeTo(result.map);
  };

  const current = (): CustomMap => useLevelEditorStore.getState().session?.draft.map ?? map;

  return {
    isReady: true as const,
    draft,
    savedId,
    tool,
    status,
    norm,
    moveLimit,
    isLimitLow: norm !== null && moveLimit !== null && moveLimit < norm,
    errorCells,
    fx,
    dialog,
    canUndo: session.past.length > 0,
    canRedo: session.future.length > 0,
    canSave: isOnline && status.kind === "valid" && !saving.isPending,
    canTryout: status.kind === "valid",
    // Part 4 §11.2: sharing opens once the level is checked, that is saved as it is now (Часть 4 §11.2: «Поделиться» доступно после проверки, то есть когда уровень сохранён в текущем виде).
    canShare: savedId !== null && !isDraftDirty(session) && status.kind === "valid",
    shareLevel: levelOfDraft(draft, savedId, norm),
    gesture: tool === "fence" ? ("edge" as const) : ("cell" as const),
    handleToolSelect: setTool,
    handleStrokeStart: () => useLevelEditorStore.getState().beginStroke(),
    handleStrokeCell: (idx: Idx, index: number) => {
      if (tool === "fence") return;
      const [row, col] = toCell(map.cols, idx);
      commit(applyCellEdit(current(), tool, [row, col], index === 0), idx);
    },
    handleStrokeEdge: ([a, b]: [Idx, Idx], index: number) => {
      const format = editFormatOf(map.rows, map.cols);
      const edit = index === 0 ? toggleFence : addFence;
      const [rowA, colA] = toCell(map.cols, a);
      const [rowB, colB] = toCell(map.cols, b);
      const result = edit(current(), format, [
        [rowA, colA],
        [rowB, colB],
      ]);
      commit("refusal" in result ? result : { map: { ...current(), ...result.map } }, null);
    },
    handleStrokeEnd: () => useLevelEditorStore.getState().endStroke(),
    handleUndo: () => useLevelEditorStore.getState().undo(),
    handleRedo: () => useLevelEditorStore.getState().redo(),
    handleTitle: (title: string) => useLevelEditorStore.getState().setTitle(title),
    handleParams: (params: Partial<CustomParams>) =>
      useLevelEditorStore.getState().setParams(params),
    handleMoveLimit: (limit: number) =>
      useLevelEditorStore.getState().setParams({ moveLimit: limit }),
    handleSave: () => saving.save(savedId, levelOfDraft(draft, savedId, norm)),
    handleTryout: () => router.push("/editor/tryout"),
    handleBack: () => {
      if (isDraftDirty(session)) setDialog("unsaved");
      else leave();
    },
    handleDiscard: () => {
      setDialog(null);
      leave();
    },
    handleDialogClose: () => setDialog(null),
    handleShare: () => setDialog("share"),
  };
};
