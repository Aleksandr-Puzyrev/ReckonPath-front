import { useSyncExternalStore } from "react";

export interface ApiSession {
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<string | null>;
  hasAccount: () => boolean;
  subscribeAccount: (listener: () => void) => () => void;
}

let session: ApiSession | null = null;
let refreshing: Promise<string | null> | null = null;

export const setApiSession = (next: ApiSession | null) => {
  session = next;
};

export const accessToken = () => session?.getAccessToken() ?? null;

// Without a registered session (tests, previews) nothing is held back; the app registers one on start (без зарегистрированной сессии — тесты, превью — ничего не ограничивается; приложение регистрирует её при старте).
export const hasAccount = () => session?.hasAccount() ?? true;

const subscribeAccount = (listener: () => void) =>
  session?.subscribeAccount(listener) ?? (() => undefined);

export const useHasAccount = () => useSyncExternalStore(subscribeAccount, hasAccount);

const runRefresh = async (current: ApiSession) => {
  try {
    return await current.refreshAccessToken();
  } finally {
    refreshing = null;
  }
};

// Concurrent 401s share one refresh and wait for its token (параллельные 401 ждут один общий refresh).
export const refreshAccessToken = async () => {
  if (session === null) return null;
  refreshing ??= runRefresh(session);
  return refreshing;
};
