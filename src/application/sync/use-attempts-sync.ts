import { onlineManager, useMutation } from "@tanstack/react-query";
import { useEffect, useEffectEvent } from "react";
import { AppState } from "react-native";

import { syncAttemptsMutationOptions } from "@features/sync-attempts";
import { useOutboxStore } from "@entities/outbox";
import { useSessionStore } from "@entities/session";

import { retryDelay, shouldRetry } from "../query/retry-policy";

export const OUTBOX_INTERVAL_MS = 60_000;

export const useAttemptsSync = () => {
  const { mutate, isPending } = useMutation({
    ...syncAttemptsMutationOptions(),
    retry: shouldRetry,
    retryDelay,
  });

  const sync = useEffectEvent(() => {
    if (!isPending) mutate();
  });

  useEffect(() => {
    sync();
    const unsubscribeOnline = onlineManager.subscribe((isOnline) => {
      if (isOnline) sync();
    });
    const appState = AppState.addEventListener("change", (state) => {
      if (state === "background") sync();
    });
    // The first guest sign-in releases attempts played before it (первый вход гостя отпускает попытки, сыгранные до него).
    const unsubscribeSession = useSessionStore.subscribe((session, previous) => {
      if (previous.accessToken === null && session.accessToken !== null) sync();
    });
    const timer = setInterval(() => {
      if (useOutboxStore.getState().attempts.length > 0) sync();
    }, OUTBOX_INTERVAL_MS);
    return () => {
      unsubscribeOnline();
      appState.remove();
      unsubscribeSession();
      clearInterval(timer);
    };
  }, []);
};
