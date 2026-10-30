import type { ApiSession } from "../api/api-session";

// A signed-in account with no tokens; tests override what they need (вошедший аккаунт без токенов; тесты подменяют нужное).
export const ACCOUNT_SESSION: ApiSession = {
  getAccessToken: () => null,
  refreshAccessToken: async () => null,
  hasAccount: () => true,
  subscribeAccount: () => () => undefined,
};
