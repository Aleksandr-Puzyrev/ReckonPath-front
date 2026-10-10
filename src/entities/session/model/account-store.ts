import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "@shared/storage";

const STORE_VERSION = 2;

export type LinkOffer = "level" | "signInLost" | "purchase";

interface AccountProgress {
  hasLogin: boolean;
  offer: LinkOffer | null;
  isLevelOfferUsed: boolean;
  isPurchaseOfferUsed: boolean;
}

interface AccountState extends AccountProgress {
  linkedNotice: number;
  requestLevelOffer: () => void;
  requestPurchaseOffer: () => boolean;
  loseSignIn: () => void;
  closeOffer: () => void;
  markRegistered: () => void;
  markSignedIn: () => void;
  reset: () => void;
}

const INITIAL: AccountProgress = {
  hasLogin: false,
  offer: null,
  isLevelOfferUsed: false,
  isPurchaseOfferUsed: false,
};

// Version 1 had no purchase offer; it is still unused for those players (в версии 1 не было предложения перед покупкой; у этих игроков оно ещё не использовано).
const progressSchema = z.object({
  hasLogin: z.boolean(),
  offer: z.enum(["level", "signInLost", "purchase"]).nullable(),
  isLevelOfferUsed: z.boolean(),
  isPurchaseOfferUsed: z.boolean().default(false),
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
      requestPurchaseOffer: () => {
        if (get().hasLogin || get().isPurchaseOfferUsed) return false;
        set({ offer: "purchase", isPurchaseOfferUsed: true });
        return true;
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
      partialize: ({
        hasLogin,
        offer,
        isLevelOfferUsed,
        isPurchaseOfferUsed,
      }): AccountProgress => ({ hasLogin, offer, isLevelOfferUsed, isPurchaseOfferUsed }),
      migrate: (persisted) => progressSchema.catch(INITIAL).parse(persisted),
    },
  ),
);
