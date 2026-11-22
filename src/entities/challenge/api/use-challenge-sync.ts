import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { arenaSocket } from "@shared/ws";

import { onChallengeNotice } from "../model/challenge-notices";

import { invalidateChallenges } from "./challenge-queries";

// A push carries only the id and the status, and the socket does not replay missed challenges, so the list is re-read after each push and each reconnect (пуш несёт только id и статус, а сокет не повторяет пропущенные вызовы, поэтому список перечитывается после каждого пуша и переподключения).
export const useChallengeSync = (isEnabled: boolean) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isEnabled) return;
    const refetch = () => void invalidateChallenges(queryClient);
    const offNotice = onChallengeNotice(refetch);
    const offReconnect = arenaSocket.onReconnect(refetch);
    return () => {
      offNotice();
      offReconnect();
    };
  }, [isEnabled, queryClient]);
};
