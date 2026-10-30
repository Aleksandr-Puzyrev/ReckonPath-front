import { useEffect, useState } from "react";

import { useBootstrapQuery, useMaintenanceQuery, useVersionQuery } from "@entities/app-config";

// The splash waits for the start-up data at most 2.5 s, then the app opens with the cache (сплэш ждёт стартовые данные не дольше 2,5 с, затем приложение открывается с кэшем).
export const SPLASH_MAX_MS = 2500;

export const useSplashState = () => {
  const startup = [useBootstrapQuery(), useVersionQuery(), useMaintenanceQuery()];
  const [isTimedOut, setIsTimedOut] = useState(false);
  const isStartupSettled = startup.every((query) => query.isFetchedAfterMount || query.isError);

  useEffect(() => {
    const timer = setTimeout(() => setIsTimedOut(true), SPLASH_MAX_MS);
    return () => clearTimeout(timer);
  }, []);

  return {
    isVisible: !isTimedOut && !isStartupSettled,
    isUpdating:
      isTimedOut && !isStartupSettled && startup.some((query) => query.fetchStatus === "fetching"),
  };
};
