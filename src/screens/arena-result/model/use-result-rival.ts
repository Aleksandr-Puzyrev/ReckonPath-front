import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { MatchView } from "@entities/match";
import { openPlayerProfile, usePlayerProfileQuery } from "@entities/player";
import type { PlayerRef, PlayerRelation } from "@entities/player";
import { useBlockPlayer } from "@features/block-player";
import { useReportPlayer } from "@features/report-player";
import { useSendFriendRequest } from "@features/send-friend-request";
import { useIsOnline } from "@shared/api";

const RELATIONS_TO_ADD: readonly PlayerRelation[] = ["none", "incoming", "outgoing"];

const rivalOf = (match: MatchView | null): PlayerRef | null => {
  if (match === null || match.rival.bot === true || match.rival.id === undefined) return null;
  return { id: match.rival.id, name: match.rival.name };
};

// The rival's profile tells whether he is a friend, has a request or is blocked; a bot has no profile (профиль соперника говорит, друг ли он, есть ли заявка и заблокирован ли он; у бота профиля нет).
export const useResultRival = (match: MatchView | null, onToast: (text: string) => void) => {
  const { t } = useTranslation();
  const rival = rivalOf(match);
  const profile = usePlayerProfileQuery(rival?.id ?? null);
  const isOnline = useIsOnline();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const send = useSendFriendRequest({
    onBefriended: (name) => onToast(t("friends.accepted", { name })),
    onError: (messageKey) => onToast(t(messageKey)),
  });
  const block = useBlockPlayer(onToast);
  const report = useReportPlayer(onToast, match?.id);
  const relation = profile.data?.relation;
  const isLive = match?.kind === "duel" && match.friendly !== true;

  return {
    rival,
    canAddFriend: isLive && relation !== undefined && RELATIONS_TO_ADD.includes(relation),
    isRequestSent: relation === "outgoing",
    isBlocked: relation === "blocked",
    isDisabled: !isOnline || send.pendingUserId !== null || block.isPending || report.isPending,
    isMenuOpen,
    block,
    report,
    handleAddFriend: () => {
      if (rival !== null) send.send(rival);
    },
    handleMenuOpen: () => setIsMenuOpen(true),
    handleMenuClose: () => setIsMenuOpen(false),
    handleBlock: () => {
      setIsMenuOpen(false);
      if (rival !== null) block.ask(rival);
    },
    handleOpenProfile: () => {
      setIsMenuOpen(false);
      if (rival !== null) openPlayerProfile(rival.id);
    },
  };
};
