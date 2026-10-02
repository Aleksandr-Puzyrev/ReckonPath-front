import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useSystemNoticeStore, useSystemState } from "@entities/app-config";
import { errorMessageKey, isApiError } from "@shared/api";
import type { ToastMessage } from "@shared/ui/toast";

import { formatClockTime } from "./format-clock-time";

const isStillMaintenance = (error: unknown) =>
  error === null || (isApiError(error) && error.code === "MAINTENANCE");

export const useMaintenanceScreen = () => {
  const { t, i18n } = useTranslation();
  const { state, isChecking, check } = useSystemState();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const until = state.kind === "maintenance" ? state.until : null;
  const message = state.kind === "maintenance" ? state.message : null;
  const timeLine =
    until === null
      ? null
      : t("system.maintenance.body", { time: formatClockTime(until, i18n.language) });
  const bodyParts = [message, timeLine].filter((part) => part !== null);

  const handleCheck = async () => {
    if (isChecking) return;
    const result = await check();
    if (result.state.kind !== "maintenance") return;
    const text = isStillMaintenance(result.error)
      ? t("system.maintenance.still")
      : t(errorMessageKey(result.error));
    setToast((current) => ({ id: (current?.id ?? 0) + 1, text }));
  };

  return {
    body: bodyParts.length === 0 ? null : bodyParts.join(" "),
    isChecking,
    toast,
    handleCheck,
    handleToastHide: () => setToast(null),
    handlePlayOffline: () => useSystemNoticeStore.getState().dismissMaintenance(),
  };
};
