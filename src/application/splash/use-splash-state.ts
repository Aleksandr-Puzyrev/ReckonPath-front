import { useIsMutating } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { ensureSessionMutationOptions } from "@entities/session";
import { useBootstrapQuery } from "@entities/app-config";

// Part 4 §2.1: the splash waits for the bootstrap at most 2.5 s, then the app opens with the cache (Часть 4 §2.1: сплэш ждёт bootstrap не дольше 2,5 с, затем приложение открывается с кэшем).
export const SPLASH_MAX_MS = 2500;

export const useSplashState = () => {
  const bootstrap = useBootstrapQuery();
  const signingIn = useIsMutating({ mutationKey: ensureSessionMutationOptions().mutationKey });
  const [isTimedOut, setIsTimedOut] = useState(false);
  const isBootstrapSettled = bootstrap.isFetchedAfterMount || bootstrap.isError;

  useEffect(() => {
    const timer = setTimeout(() => setIsTimedOut(true), SPLASH_MAX_MS);
    return () => clearTimeout(timer);
  }, []);

  return {
    isVisible: !isTimedOut && !(isBootstrapSettled && signingIn === 0),
    isUpdating: isTimedOut && !isBootstrapSettled && bootstrap.fetchStatus === "fetching",
  };
};
