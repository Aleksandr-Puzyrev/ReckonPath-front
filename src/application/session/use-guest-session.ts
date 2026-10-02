import { onlineManager, useMutation } from "@tanstack/react-query";
import { useEffect, useEffectEvent } from "react";
import { AppState } from "react-native";

import { apiSession, ensureSessionMutationOptions } from "@entities/session";
import { setApiSession } from "@shared/api";

import { retryDelay, shouldRetry } from "../query/retry-policy";

// Set on import, before any screen sends a request; an effect would run after the screens' own effects (задаётся при импорте, до запросов экранов; эффект сработал бы после эффектов самих экранов).
setApiSession(apiSession);

export const useGuestSession = () => {
  const { mutate, isPending } = useMutation({
    ...ensureSessionMutationOptions(),
    retry: shouldRetry,
    retryDelay,
  });

  const ensure = useEffectEvent(() => {
    if (!isPending) mutate();
  });

  useEffect(() => {
    ensure();
    const unsubscribeOnline = onlineManager.subscribe((isOnline) => {
      if (isOnline) ensure();
    });
    const appState = AppState.addEventListener("change", (state) => {
      if (state === "active") ensure();
    });
    return () => {
      unsubscribeOnline();
      appState.remove();
    };
  }, []);
};
