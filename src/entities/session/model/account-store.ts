import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "@shared/storage";

const STORE_VERSION = 3;

export type LinkOffer = "level" | "signInLost" | "purchase" | "arena";

interface AccountProgress {
  hasLogin: boolean;
  offer: LinkOffer | null;
  isLevelOfferUsed: boolean;
  isPurchaseOfferUsed: boolean;
  isArenaOfferUsed: boolean;
}

interface AccountState extends AccountProgress {
  linkedNotice: number;
  declined: { offer: LinkOffer; id: number } | null;
  requestLevelOffer: () => void;
  requestPurchaseOffer: () => boolean;
  requestArenaOffer: () => boolean;
  declineOffer: () => void;
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
  isArenaOfferUsed: false,
};

// Older versions had no purchase or arena offer; they are still unused for those players (в старых версиях не было предложений перед покупкой и ареной; у этих игроков они ещё не использованы).
const progressSchema = z.object({
  hasLogin: z.boolean(),
  offer: z.enum(["level", "signInLost", "purchase", "arena"]).nullable(),
  isLevelOfferUsed: z.boolean(),
  isPurchaseOfferUsed: z.boolean().default(false),
  isArenaOfferUsed: z.boolean().default(false),
});

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      ...INITIAL,
      linkedNotice: 0,
      declined: null,
      requestLevelOffer: () => {
        if (get().hasLogin || get().isLevelOfferUsed) return;
        set({ offer: "level", isLevelOfferUsed: true });
      },
      requestPurchaseOffer: () => {
        if (get().hasLogin || get().isPurchaseOfferUsed) return false;
        set({ offer: "purchase", isPurchaseOfferUsed: true });
        return true;
      },
      requestArenaOffer: () => {
        if (get().hasLogin || get().isArenaOfferUsed) return false;
        set({ offer: "arena", isArenaOfferUsed: true });
        return true;
      },
      declineOffer: () => {
        const { offer, declined } = get();
        set({
          offer: null,
          declined: offer === null ? declined : { offer, id: (declined?.id ?? 0) + 1 },
        });
      },
      loseSignIn: () => {
        if (get().hasLogin) set({ hasLogin: false, offer: "signInLost" });
      },
      closeOffer: () => set({ offer: null }),
      markRegistered: () =>
        set({ hasLogin: true, offer: null, linkedNotice: get().linkedNotice + 1 }),
      markSignedIn: () => set({ hasLogin: true, offer: null }),
      reset: () => set({ ...INITIAL, linkedNotice: 0, declined: null }),
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
        isArenaOfferUsed,
      }): AccountProgress => ({
        hasLogin,
        offer,
        isLevelOfferUsed,
        isPurchaseOfferUsed,
        isArenaOfferUsed,
      }),
      migrate: (persisted) => progressSchema.catch(INITIAL).parse(persisted),
    },
  ),
);
