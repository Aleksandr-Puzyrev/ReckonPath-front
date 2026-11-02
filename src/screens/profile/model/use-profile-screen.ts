import { useState } from "react";

import { useInventoryQuery } from "@entities/item";
import { useAccountStore } from "@entities/session";
import { useMeQuery } from "@entities/wallet";
import { useIsOnline } from "@shared/api";
import type { CollectionSlot } from "@widgets/collection";

export const useProfileScreen = () => {
  const me = useMeQuery();
  const hasLogin = useAccountStore((state) => state.hasLogin);
  const { data: inventory } = useInventoryQuery();
  const isOnline = useIsOnline();
  const [slot, setSlot] = useState<CollectionSlot | null>(null);
  const [isEarnOpen, setIsEarnOpen] = useState(false);

  return {
    me: me.data,
    isGuest: !hasLogin,
    isPending: me.isPending,
    isOnline,
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
