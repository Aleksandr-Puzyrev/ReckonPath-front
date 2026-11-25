import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useServerMinute } from "@entities/app-config";
import { ADD_FRIEND_PARAM, useFriendsQuery } from "@entities/friend";
import { leaderboardTimerOf, useLeaderboardQuery } from "@entities/leaderboard";
import type { LeaderboardPeriod, LeaderboardScope } from "@entities/leaderboard";
import { openPlayerProfile } from "@entities/player";
import { useIsOnline } from "@shared/api";

export const useLeaderboardsScreen = () => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<LeaderboardPeriod>("week");
  const [scope, setScope] = useState<LeaderboardScope>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const board = useLeaderboardQuery(period, scope);
  const { data: friends } = useFriendsQuery();
  const isOnline = useIsOnline();
  const now = useServerMinute();
  const isNoFriends = scope === "friends" && friends?.counts.friends === 0;
  const rows = board.data === undefined || isNoFriends ? [] : board.data.items;

  return {
    period,
    scope,
    rows,
    me: board.data?.me,
    timer: board.data === undefined ? null : leaderboardTimerOf(period, board.data.endsAt, now, t),
    hasData: board.data !== undefined,
    isNoFriends,
    isPending: board.isPending,
    error: board.error,
    isOnline,
    isRefreshing,
    handlePeriodChange: setPeriod,
    handleScopeChange: setScope,
    handleRetry: () => void board.refetch(),
    handleRefresh: async () => {
      setIsRefreshing(true);
      await board.refetch();
      setIsRefreshing(false);
    },
    handleInvite: () => router.push({ pathname: "/friends", params: { add: ADD_FRIEND_PARAM } }),
    handleOpenProfile: openPlayerProfile,
    handleBack: () => router.back(),
  };
};
