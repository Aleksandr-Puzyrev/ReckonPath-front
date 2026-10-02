import NetInfo from "@react-native-community/netinfo";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { focusManager, onlineManager, QueryClient } from "@tanstack/react-query";
import { AppState } from "react-native";

import { APP_VERSION } from "@shared/config";
import { keyValueStorage } from "@shared/storage";

import { retryDelay, shouldRetry } from "./retry-policy";

const CACHE_MAX_AGE_MS = 24 * 60 * 60_000;

export const queryClient = new QueryClient({
  defaultOptions: {
    // The cache outlives the persisted copy, or restored data is dropped at once (кэш живёт не меньше сохранённой копии, иначе восстановленные данные сразу удаляются).
    queries: { retry: shouldRetry, retryDelay, gcTime: CACHE_MAX_AGE_MS },
  },
});

export const persistOptions = {
  persister: createAsyncStoragePersister({ storage: keyValueStorage, key: "query-cache" }),
  maxAge: CACHE_MAX_AGE_MS,
  buster: APP_VERSION,
};

onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(state.isConnected !== false)),
);

focusManager.setEventListener((setFocused) => {
  const subscription = AppState.addEventListener("change", (state) =>
    setFocused(state === "active"),
  );
  return () => subscription.remove();
});
