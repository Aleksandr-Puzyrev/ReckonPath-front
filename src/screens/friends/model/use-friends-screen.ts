import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ADD_FRIEND_PARAM, useFriendsQuery, useRefreshFriendsOnFocus } from "@entities/friend";
import type { Friend } from "@entities/friend";
import { useAnswerFriendRequest } from "@features/answer-friend-request";
import { useArenaAccess } from "@features/arena-access";
import { useChallengeFriend } from "@features/challenge-friend";
import { useRemoveFriend } from "@features/remove-friend";
import type { ErrorMessageKey } from "@shared/api";
import { useIsOnline } from "@shared/api";

import { friendsRowsOf } from "./friends-rows";
import { lockReasonOf } from "./lock-reason-of";
import type { FriendsTab } from "./friends-rows";

export const useFriendsScreen = (onToast: (text: string) => void) => {
  const { t } = useTranslation();
  const { add } = useLocalSearchParams<{ add?: string }>();
  const friends = useFriendsQuery();
  const isOnline = useIsOnline();
  const [tab, setTab] = useState<FriendsTab>("friends");
  // Offline the route param does not open the sheet: nothing in it works without the network (без сети параметр маршрута не открывает лист: без сети в нём ничего не работает).
  const [isAddOpen, setIsAddOpen] = useState(add === ADD_FRIEND_PARAM && isOnline);
  const [menuFriend, setMenuFriend] = useState<Friend | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const showError = (messageKey: ErrorMessageKey) => onToast(t(messageKey));
  const answer = useAnswerFriendRequest({
    onAccepted: (name) => onToast(t("friends.accepted", { name })),
    onError: showError,
  });
  const remove = useRemoveFriend(showError);
  const access = useArenaAccess();
  const challenge = useChallengeFriend(access, onToast);
  const isDisabled = !isOnline || answer.isPending;
  const challengeLockReason = lockReasonOf(access, t);
  useRefreshFriendsOnFocus();

  return {
    list: friends.data,
    rows: friends.data === undefined ? [] : friendsRowsOf(friends.data, tab),
    isPending: friends.isPending,
    error: friends.error,
    isOnline,
    isDisabled,
    tab,
    isAddOpen,
    menuFriend,
    isRefreshing,
    challengeLockReason,
    rowState: { isDisabled, challengeLockReason, removingId: remove.removingId },
    answer,
    remove,
    challenge,
    handleTabChange: setTab,
    handleAddOpen: () => setIsAddOpen(true),
    handleAddClose: () => setIsAddOpen(false),
    handleMore: setMenuFriend,
    handleMenuClose: () => setMenuFriend(null),
    handleRetry: () => void friends.refetch(),
    handleRefresh: async () => {
      setIsRefreshing(true);
      await friends.refetch();
      setIsRefreshing(false);
    },
    handleBack: () => (router.canGoBack() ? router.back() : router.replace("/profile")),
  };
};
