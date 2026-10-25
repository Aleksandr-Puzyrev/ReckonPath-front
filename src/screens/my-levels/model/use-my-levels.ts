import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useDeleteCustomLevel } from "@features/manage-custom-level";
import {
  emptyDraft,
  NEW_LEVEL_ID,
  useCustomLevelsQuery,
  useLevelEditorStore,
} from "@entities/custom-level";
import type { CustomParams } from "@entities/custom-level";
import { useIsOnline } from "@shared/api";
import type { ToastMessage } from "@shared/ui/toast";

export const useMyLevels = () => {
  const { t } = useTranslation();
  const levels = useCustomLevelsQuery();
  const isOnline = useIsOnline();
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (text: string) => setToast((current) => ({ id: (current?.id ?? 0) + 1, text }));
  const { remove, isPending: isDeleting } = useDeleteCustomLevel((messageKey) =>
    showToast(t(messageKey)),
  );
  const items = levels.data ?? [];

  const openEditor = (id: string) => router.push({ pathname: "/editor/[id]", params: { id } });

  return {
    items,
    isPending: levels.isPending,
    isError: levels.isError,
    isOnline,
    isNewOpen,
    deletingId,
    isDeleting,
    toast,
    handleToastHide: () => setToast(null),
    handleRetry: () => void levels.refetch(),
    handleNewOpen: () => setIsNewOpen(true),
    handleNewClose: () => setIsNewOpen(false),
    handleCreate: (rows: number, cols: number, probeMode: CustomParams["probeMode"]) => {
      setIsNewOpen(false);
      const title = t("editor.defaultName", { n: items.length + 1 });
      // A new level always starts from a clean draft (новый уровень всегда начинается с чистого черновика).
      useLevelEditorStore.getState().reset();
      useLevelEditorStore
        .getState()
        .open(NEW_LEVEL_ID, emptyDraft(title, rows, cols, probeMode), null);
      openEditor(NEW_LEVEL_ID);
    },
    handleOpen: openEditor,
    handleDeleteAsk: setDeletingId,
    handleDeleteCancel: () => setDeletingId(null),
    handleDeleteConfirm: () => {
      if (deletingId !== null) remove(deletingId);
      setDeletingId(null);
    },
  };
};
