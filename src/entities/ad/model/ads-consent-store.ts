import { create } from "zustand";

interface AdsConsentState {
  isPreScreenOpen: boolean;
  openPreScreen: () => void;
  closePreScreen: () => void;
  reset: () => void;
}

// Screen state only: the system keeps whether tracking was asked (только состояние экрана: был ли запрос, хранит система).
export const useAdsConsentStore = create<AdsConsentState>()((set) => ({
  isPreScreenOpen: false,
  openPreScreen: () => set({ isPreScreenOpen: true }),
  closePreScreen: () => set({ isPreScreenOpen: false }),
  reset: () => set({ isPreScreenOpen: false }),
}));
