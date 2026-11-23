import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { PlayerRef } from "@entities/player";
import { errorMessageKey } from "@shared/api";

import { reportPlayerMutationOptions } from "../api/report-player-mutation";

import type { OfferedReportReason } from "./report-reasons";

export const useReportPlayer = (onToast: (text: string) => void, matchId?: string) => {
  const { t } = useTranslation();
  const [sent, setSent] = useState<readonly OfferedReportReason[]>([]);
  const { mutate, isPending } = useMutation({
    ...reportPlayerMutationOptions(),
    onError: (error) => onToast(t(errorMessageKey(error))),
  });

  return {
    sent,
    isPending,
    report: (player: PlayerRef, reason: OfferedReportReason) =>
      mutate(
        { userId: player.id, reason, ...(matchId === undefined ? {} : { matchId }) },
        {
          onSuccess: () => {
            setSent((current) => [...current, reason]);
            onToast(t("report.sent"));
          },
        },
      ),
  };
};
