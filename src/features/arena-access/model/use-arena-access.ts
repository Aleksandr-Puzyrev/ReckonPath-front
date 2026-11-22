import { useMeQuery } from "@entities/wallet";

import { hasArenaBan } from "./has-arena-ban";
import { useArenaUnlock } from "./arena-unlock";

export const useArenaAccess = () => {
  const { isUnlocked, unlockLevel } = useArenaUnlock();
  const { data: me } = useMeQuery();
  return { isUnlocked, unlockLevel, isBanned: hasArenaBan(me) };
};
