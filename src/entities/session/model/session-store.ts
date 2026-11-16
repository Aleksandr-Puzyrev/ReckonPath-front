import { create } from "zustand";

interface SessionState {
  accessToken: string | null;
  expiresAt: number | null;
  setAccessToken: (accessToken: string | null, expiresAt?: number | null) => void;
  isExpired: (now?: number) => boolean;
  reset: () => void;
}

// A token about to expire is treated as expired, so a connection opened with it does not drop at once (токен, который вот-вот истечёт, считается истёкшим, чтобы открытое с ним соединение не оборвалось сразу).
const EXPIRY_MARGIN_MS = 30_000;

export const useSessionStore = create<SessionState>()((set, get) => ({
  accessToken: null,
  expiresAt: null,
  setAccessToken: (accessToken, expiresAt = null) => set({ accessToken, expiresAt }),
  isExpired: (now = Date.now()) => {
    const { accessToken, expiresAt } = get();
    return accessToken !== null && expiresAt !== null && now >= expiresAt - EXPIRY_MARGIN_MS;
  },
  reset: () => set({ accessToken: null, expiresAt: null }),
}));
