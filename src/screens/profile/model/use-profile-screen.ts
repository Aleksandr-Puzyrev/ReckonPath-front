import { useState } from "react";

import { useFriendsQuery, useRefreshFriendsOnFocus } from "@entities/friend";
import { useInventoryQuery } from "@entities/item";
import { useAccountStore } from "@entities/session";
import { useMeQuery } from "@entities/wallet";
import { useIsOnline } from "@shared/api";
import type { CollectionSlot } from "@widgets/collection";

export const useProfileScreen = () => {
  const me = useMeQuery();
  const hasLogin = useAccountStore((state) => state.hasLogin);
  const { data: inventory } = useInventoryQuery();
  const { data: friends } = useFriendsQuery();
  const isOnline = useIsOnline();
  const [slot, setSlot] = useState<CollectionSlot | null>(null);
  const [isEarnOpen, setIsEarnOpen] = useState(false);
  useRefreshFriendsOnFocus();

  return {
    me: me.data,
    isGuest: !hasLogin,
    isPending: me.isPending,
    isOnline,
    friendCounts: friends?.counts,
    inventory: inventory?.items ?? [],
    loadout: inventory?.loadout ?? {},
    slot,
    isEarnOpen,
    handleRetry: () => void me.refetch(),
    handleSlotPress: setSlot,
    handleSlotClose: () => setSlot(null),
    handleWalletPress: () => setIsEarnOpen(true),
    handleEarnClose: () => setIsEarnOpen(false),
  };
};
