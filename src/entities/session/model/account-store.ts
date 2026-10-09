import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "@shared/storage";

const STORE_VERSION = 1;

export type LinkOffer = "level" | "signInLost";

interface AccountProgress {
  hasLogin: boolean;
  offer: LinkOffer | null;
  isLevelOfferUsed: boolean;
}

interface AccountState extends AccountProgress {
  linkedNotice: number;
  requestLevelOffer: () => void;
  loseSignIn: () => void;
  closeOffer: () => void;
  markRegistered: () => void;
  markSignedIn: () => void;
  reset: () => void;
}

const INITIAL: AccountProgress = { hasLogin: false, offer: null, isLevelOfferUsed: false };

const progressSchema = z.object({
  hasLogin: z.boolean(),
  offer: z.enum(["level", "signInLost"]).nullable(),
  isLevelOfferUsed: z.boolean(),
});

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      ...INITIAL,
      linkedNotice: 0,
      requestLevelOffer: () => {
        if (get().hasLogin || get().isLevelOfferUsed) return;
        set({ offer: "level", isLevelOfferUsed: true });
      },
      loseSignIn: () => {
        if (get().hasLogin) set({ hasLogin: false, offer: "signInLost" });
      },
      closeOffer: () => set({ offer: null }),
      markRegistered: () =>
        set({ hasLogin: true, offer: null, linkedNotice: get().linkedNotice + 1 }),
      markSignedIn: () => set({ hasLogin: true, offer: null }),
      reset: () => set({ ...INITIAL, linkedNotice: 0 }),
    }),
    {
      name: "account",
      version: STORE_VERSION,
      storage: createJSONStorage(() => zustandStorage),
      partialize: ({ hasLogin, offer, isLevelOfferUsed }): AccountProgress => ({
        hasLogin,
        offer,
        isLevelOfferUsed,
      }),
      migrate: (persisted) => progressSchema.catch(INITIAL).parse(persisted),
    },
  ),
);
