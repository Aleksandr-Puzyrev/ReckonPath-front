import { useAccountStore } from "@entities/session";

export const LINK_OFFER_LEVEL = 6;

export const offerLinkAfterLevel = (levelNumber: number) => {
  if (levelNumber === LINK_OFFER_LEVEL) useAccountStore.getState().requestLevelOffer();
};
