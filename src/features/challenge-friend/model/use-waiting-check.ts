import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useEffectEvent } from "react";
import { AppState } from "react-native";

import { useClockOffset } from "@entities/app-config";
import { challengesQueryOptions } from "@entities/challenge";
import { matchSession } from "@entities/match";
import { arenaSocket } from "@shared/ws";

import type { WaitingChallenge } from "./use-challenge-friend";

// Pushes missed while the socket was down are not replayed: after a reconnect or a return to the app the list tells whether the challenge still waits, and the match is re-read in case it was accepted (пуши, пропущенные без сокета, не повторяются: после переподключения или возврата в приложение список показывает, ждёт ли ещё вызов, а матч перечитывается на случай, если вызов приняли).
export const useWaitingCheck = (
  waiting: WaitingChallenge | null,
  onGone: (id: string, isExpired: boolean) => void,
) => {
  const queryClient = useQueryClient();
  const offset = useClockOffset();
  const isWaiting = waiting !== null;

  const check = useEffectEvent(async () => {
    if (waiting === null) return;
    const { id, expiresAt } = waiting.challenge;
    let outgoing: readonly { id: string }[];
    try {
      ({ outgoing } = await queryClient.fetchQuery({ ...challengesQueryOptions(), staleTime: 0 }));
    } catch {
      // The waiting stays; the clock still ends it (ожидание остаётся; его всё равно закончат часы).
      return;
    }
    if (outgoing.some((challenge) => challenge.id === id)) return;
    void matchSession.refresh();
    onGone(id, Date.now() + offset >= Date.parse(expiresAt));
  });

  useEffect(() => {
    if (!isWaiting) return;
    const offReconnect = arenaSocket.onReconnect(() => void check());
    const appState = AppState.addEventListener("change", (state) => {
      if (state === "active") void check();
    });
    return () => {
      offReconnect();
      appState.remove();
    };
  }, [isWaiting]);
};
