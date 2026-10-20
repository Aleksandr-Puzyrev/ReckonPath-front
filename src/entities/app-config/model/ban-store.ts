import { create } from "zustand";

import type { Ban } from "./ban";

interface BanState {
  ban: Ban | null;
  setBan: (ban: Ban) => void;
  reset: () => void;
}

// Not persisted: the server repeats BANNED on the next launch while the ban lasts (не сохраняется: пока бан действует, сервер повторит BANNED при следующем запуске).
export const useBanStore = create<BanState>()((set) => ({
  ban: null,
  setBan: (ban) => set({ ban }),
  reset: () => set({ ban: null }),
}));
