import { create } from "zustand";

interface SessionState {
  accessToken: string | null;
  setAccessToken: (accessToken: string | null) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  accessToken: null,
  setAccessToken: (accessToken) => set({ accessToken }),
  reset: () => set({ accessToken: null }),
}));
