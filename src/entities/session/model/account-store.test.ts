import { useAccountStore } from "./account-store";

const store = () => useAccountStore.getState();

describe("useAccountStore", () => {
  beforeEach(() => store().reset());

  test("offers linking after level 6 once", () => {
    store().requestLevelOffer();
    expect(store().offer).toBe("level");

    store().closeOffer();
    store().requestLevelOffer();

    expect(store().offer).toBeNull();
  });

  test("does not offer linking to an account with a login", () => {
    store().markSignedIn();

    store().requestLevelOffer();

    expect(store().offer).toBeNull();
  });

  test("offers signing in again when an account with a login loses its session", () => {
    store().markSignedIn();

    store().loseSignIn();

    expect(store()).toMatchObject({ hasLogin: false, offer: "signInLost" });
  });

  test("ignores a lost session of a guest", () => {
    store().loseSignIn();

    expect(store().offer).toBeNull();
  });

  test("offers linking before the first emerald purchase once", () => {
    expect(store().requestPurchaseOffer()).toBe(true);
    expect(store().offer).toBe("purchase");

    store().closeOffer();

    expect(store().requestPurchaseOffer()).toBe(false);
    expect(store().offer).toBeNull();
  });

  test("lets an account with a login buy without the offer", () => {
    store().markSignedIn();

    expect(store().requestPurchaseOffer()).toBe(false);
  });

  test("announces a registration and closes the offer", () => {
    store().requestLevelOffer();

    store().markRegistered();

    expect(store()).toMatchObject({ hasLogin: true, offer: null, linkedNotice: 1 });
  });

  test("resets to a guest without offers", () => {
    store().markRegistered();

    store().reset();

    expect(store()).toMatchObject({
      hasLogin: false,
      offer: null,
      isLevelOfferUsed: false,
      isPurchaseOfferUsed: false,
      linkedNotice: 0,
    });
  });

  test("keeps valid data and drops corrupt data on migration", () => {
    const { migrate } = useAccountStore.persist.getOptions();
    const saved = {
      hasLogin: true,
      offer: "signInLost",
      isLevelOfferUsed: true,
      isPurchaseOfferUsed: true,
    };

    expect(migrate?.(saved, 1)).toEqual(saved);
    expect(migrate?.({ offer: "banner" }, 1)).toEqual({
      hasLogin: false,
      offer: null,
      isLevelOfferUsed: false,
      isPurchaseOfferUsed: false,
    });
  });

  test("adds an unused purchase offer to version 1 data", () => {
    const { migrate } = useAccountStore.persist.getOptions();

    expect(migrate?.({ hasLogin: false, offer: null, isLevelOfferUsed: true }, 1)).toEqual({
      hasLogin: false,
      offer: null,
      isLevelOfferUsed: true,
      isPurchaseOfferUsed: false,
    });
  });
});
