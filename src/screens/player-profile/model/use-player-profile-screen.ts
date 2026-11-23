import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { usePlayerProfileQuery } from "@entities/player";
import type { PlayerRef } from "@entities/player";
import { useArenaAccess } from "@features/arena-access";
import { useBlockPlayer } from "@features/block-player";
import { lockReasonOf, useChallengeFriend } from "@features/challenge-friend";
import { useRemoveFriend } from "@features/remove-friend";
import { useReportPlayer } from "@features/report-player";
import { useSendFriendRequest } from "@features/send-friend-request";
import { useIsOnline } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

type OpenSheet = "menu" | "report" | null;

export const usePlayerProfileScreen = (onToast: (text: string) => void) => {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = usePlayerProfileQuery(id);
  const isOnline = useIsOnline();
  const [sheet, setSheet] = useState<OpenSheet>(null);
  const [openedAt] = useState(Date.now);
  const showError = (messageKey: ErrorMessageKey) => onToast(t(messageKey));
  const send = useSendFriendRequest({
    onBefriended: (name) => onToast(t("friends.accepted", { name })),
    onError: showError,
  });
  const block = useBlockPlayer(onToast);
  const report = useReportPlayer(onToast);
  const remove = useRemoveFriend(showError);
  const access = useArenaAccess();
  const challenge = useChallengeFriend(access, onToast);
  const data = profile.data;
  const relation = data?.relation;
  const player: PlayerRef | null = data === undefined ? null : { id: data.id, name: data.name };

  useEffect(() => {
    if (relation === "self") router.replace("/profile");
  }, [relation]);

  const choose = (action: (target: PlayerRef) => void) => {
    setSheet(null);
    if (player !== null) action(player);
  };

  return {
    data,
    player,
    openedAt,
    isPending: profile.isPending,
    error: profile.error,
    isOnline,
    isDisabled:
      !isOnline ||
      send.pendingUserId !== null ||
      block.isPending ||
      remove.removingId !== null ||
      challenge.isSending,
    sheet,
    challengeLockReason: lockReasonOf(access, t),
    block,
    report,
    remove,
    challenge,
    handleBack: () => (router.canGoBack() ? router.back() : router.replace("/")),
    handleRetry: () => void profile.refetch(),
    handleMenuOpen: () => setSheet("menu"),
    handleSheetClose: () => setSheet(null),
    handleReportOpen: () => setSheet("report"),
    handleBlock: () => choose(block.ask),
    handleRemove: () => choose(remove.ask),
    handleSend: () => {
      if (player !== null) send.send(player);
    },
    handleUnblock: () => {
      if (player !== null) block.unblock(player);
    },
    handleChallenge: () => {
      if (data === undefined) return;
      challenge.handleChallenge({
        id: data.id,
        name: data.name,
        trophies: data.trophies,
        league: data.league.league,
      });
    },
  };
};
