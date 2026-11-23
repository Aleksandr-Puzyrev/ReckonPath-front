import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useClockOffset } from "@entities/app-config";
import { useArenaQuery } from "@entities/arena";
import { invalidateChallenges, onChallengeNotice } from "@entities/challenge";
import type { Challenge, ChallengeStatus } from "@entities/challenge";
import { invalidateFriends } from "@entities/friend";
import type { Friend } from "@entities/friend";
import { invalidatePlayers } from "@entities/player";
import { matchSession, useMatchStore } from "@entities/match";
import { errorMessageKey, errorMessageValues, isApiError } from "@shared/api";

import {
  cancelChallengeMutationOptions,
  sendChallengeMutationOptions,
} from "../api/challenge-friend-mutations";

import { isChallengeOver, outcomeToastKeyOf } from "./challenge-outcome";
import { useWaitingCheck } from "./use-waiting-check";

// The server's expiry tick runs a little after expires_at, so its push gets a head start over the clock (тик истечения на сервере идёт чуть позже expires_at, поэтому его пуш получает фору перед часами).
const EXPIRY_GRACE_MS = 2000;

export interface WaitingChallenge {
  challenge: Challenge;
  startedAt: number;
}

interface ArenaAccess {
  isUnlocked: boolean;
  unlockLevel: number;
  isBanned: boolean;
}

export const useChallengeFriend = (access: ArenaAccess, onToast: (text: string) => void) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const offset = useClockOffset();
  const [friend, setFriend] = useState<Friend | null>(null);
  const [waiting, setWaiting] = useState<WaitingChallenge | null>(null);
  const isSendingRef = useRef(false);
  const isOpen = access.isUnlocked && !access.isBanned;
  const arena = useArenaQuery(isOpen || friend !== null);
  const showError = (error: unknown) =>
    onToast(t(errorMessageKey(error, "arena"), errorMessageValues(error)));

  const send = useMutation({
    ...sendChallengeMutationOptions(),
    onSuccess: (challenge) => {
      setFriend(null);
      setWaiting({ challenge, startedAt: Date.now() + offset });
    },
    onError: (error) => {
      setFriend(null);
      const runningId = isApiError(error) ? error.details.id : undefined;
      if (
        isApiError(error) &&
        error.code === "match_in_progress" &&
        typeof runningId === "string"
      ) {
        void matchSession.refresh();
        router.push({ pathname: "/arena/match/[id]", params: { id: runningId } });
        return;
      }
      if (isApiError(error) && error.code === "not_friends") {
        void invalidateFriends(queryClient);
        void invalidatePlayers(queryClient);
      }
      showError(error);
    },
    onSettled: () => {
      isSendingRef.current = false;
    },
  });

  const cancel = useMutation({
    ...cancelChallengeMutationOptions(),
    onSettled: () => invalidateChallenges(queryClient),
    onError: showError,
  });

  const close = (current: WaitingChallenge, status: ChallengeStatus) => {
    if (!isChallengeOver(status)) return;
    setWaiting(null);
    const toastKey = outcomeToastKeyOf(status);
    if (toastKey !== null) onToast(t(toastKey, { name: current.challenge.to.name }));
  };

  const finish = useEffectEvent((status: ChallengeStatus) => {
    if (waiting !== null) close(waiting, status);
  });

  const waitingId = waiting?.challenge.id ?? null;
  const expiresAt = waiting?.challenge.expiresAt ?? null;

  useEffect(() => {
    if (waitingId === null) return;
    return onChallengeNotice(({ id, status }) => {
      if (id === waitingId) finish(status);
    });
  }, [waitingId]);

  // The expiry push may be lost with the socket, so the waiting also ends by the clock (пуш об истечении может потеряться вместе с сокетом, поэтому ожидание заканчивается и по часам).
  useEffect(() => {
    if (expiresAt === null) return;
    const timer = setTimeout(
      () => finish("expired"),
      Math.max(0, Date.parse(expiresAt) + EXPIRY_GRACE_MS - (Date.now() + offset)),
    );
    return () => clearTimeout(timer);
  }, [expiresAt, offset]);

  // A friendly match in the store means the friend accepted, even if that push was lost (дружеский матч в хранилище значит, что друг принял, даже если этот пуш потерялся).
  useEffect(() => {
    if (waitingId === null) return;
    return useMatchStore.subscribe(({ view }) => {
      if (view?.friendly === true && view.status !== "done") finish("accepted");
    });
  }, [waitingId]);

  useWaitingCheck(waiting, (id, isExpired) => {
    if (waiting !== null && waiting.challenge.id === id) {
      close(waiting, isExpired ? "expired" : "cancelled");
    }
  });

  return {
    friend,
    waiting,
    format: arena.data?.league.format ?? null,
    isSending: send.isPending,
    handleChallenge: (next: Friend) => {
      if (access.isBanned) {
        onToast(t("errors.arena_banned"));
        return;
      }
      if (!access.isUnlocked) {
        onToast(t("errors.arena_locked", { level: access.unlockLevel }));
        return;
      }
      setFriend(next);
    },
    handleClose: () => setFriend(null),
    handleSend: () => {
      if (friend === null || isSendingRef.current) return;
      isSendingRef.current = true;
      send.mutate(friend.id);
    },
    handleCancel: () => {
      if (waiting === null) return;
      setWaiting(null);
      cancel.mutate(waiting.challenge.id);
    },
  };
};
