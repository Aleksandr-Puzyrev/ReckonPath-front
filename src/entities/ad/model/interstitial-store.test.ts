import { useInterstitialStore } from "./interstitial-store";

const store = () => useInterstitialStore.getState();

describe("useInterstitialStore", () => {
  beforeEach(() => store().reset());

  test("remembers only the first launch", () => {
    store().markLaunched(1);
    store().markLaunched(2);

    expect(store().firstLaunchAt).toBe(1);
  });

  test("counts finished levels until an interstitial resets them", () => {
    store().countFinishedLevel();
    store().countFinishedLevel();
    expect(store().finishedLevels).toBe(2);

    store().markInterstitialShown(5);

    expect(store()).toMatchObject({ finishedLevels: 0, lastAdAt: 5 });
  });

  test("notes a rewarded ad without touching the counter", () => {
    store().countFinishedLevel();

    store().noteAdShown(7);

    expect(store()).toMatchObject({ finishedLevels: 1, lastAdAt: 7 });
  });

  test("keeps valid data and drops corrupt data on migration", () => {
    const { migrate } = useInterstitialStore.persist.getOptions();
    const saved = { firstLaunchAt: 1, finishedLevels: 2, lastAdAt: 3 };

    expect(migrate?.(saved, 0)).toEqual(saved);
    expect(migrate?.({ finishedLevels: -1 }, 0)).toEqual({
      firstLaunchAt: null,
      finishedLevels: 0,
      lastAdAt: null,
    });
  });
});
