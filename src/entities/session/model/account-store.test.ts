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

    expect(migrate?.(saved, 1)).toEqual({ ...saved, isArenaOfferUsed: false });
    expect(migrate?.({ offer: "banner" }, 1)).toEqual({
      hasLogin: false,
      offer: null,
      isLevelOfferUsed: false,
      isPurchaseOfferUsed: false,
      isArenaOfferUsed: false,
    });
  });

  test("adds an unused purchase offer to version 1 data", () => {
    const { migrate } = useAccountStore.persist.getOptions();

    expect(migrate?.({ hasLogin: false, offer: null, isLevelOfferUsed: true }, 1)).toEqual({
      hasLogin: false,
      offer: null,
      isLevelOfferUsed: true,
      isPurchaseOfferUsed: false,
      isArenaOfferUsed: false,
    });
  });
});

describe("arena link offer", () => {
  afterEach(() => useAccountStore.getState().reset());

  test("offers linking once before the first arena match (ARN-02)", () => {
    expect(useAccountStore.getState().requestArenaOffer()).toBe(true);
    useAccountStore.getState().declineOffer();

    expect(useAccountStore.getState().requestArenaOffer()).toBe(false);
  });

  test("reports «Позже» so the search can go on", () => {
    useAccountStore.getState().requestArenaOffer();

    useAccountStore.getState().declineOffer();

    expect(useAccountStore.getState()).toEqual(
      expect.objectContaining({ offer: null, declined: { offer: "arena", id: 1 } }),
    );
  });

  test("migrates a version 2 state with the arena offer unused", async () => {
    const { migrate } = useAccountStore.persist.getOptions();

    expect(
      await migrate?.(
        { hasLogin: false, offer: null, isLevelOfferUsed: true, isPurchaseOfferUsed: true },
        2,
      ),
    ).toEqual(expect.objectContaining({ isArenaOfferUsed: false }));
  });
});
