import { useAccountStore } from "@entities/session";

import { LINK_OFFER_LEVEL, offerLinkAfterLevel } from "./offer-link-after-level";

describe("offerLinkAfterLevel", () => {
  beforeEach(() => useAccountStore.getState().reset());

  test("offers linking after campaign level 6", () => {
    offerLinkAfterLevel(LINK_OFFER_LEVEL);

    expect(useAccountStore.getState().offer).toBe("level");
  });

  test("offers nothing after another level", () => {
    offerLinkAfterLevel(LINK_OFFER_LEVEL - 1);

    expect(useAccountStore.getState().offer).toBeNull();
  });
});
