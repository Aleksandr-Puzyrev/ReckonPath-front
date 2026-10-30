import { useGuestAdContinueStore } from "./guest-ad-continue-store";

const store = () => useGuestAdContinueStore.getState();

describe("useGuestAdContinueStore", () => {
  afterEach(() => store().reset());

  test("counts the uses of the day", () => {
    store().countUse("2026-10-25");
    store().countUse("2026-10-25");

    expect(store().usedOn("2026-10-25")).toBe(2);
  });

  test("starts every new day from zero", () => {
    store().countUse("2026-10-25");

    expect(store().usedOn("2026-10-26")).toBe(0);
    store().countUse("2026-10-26");
    expect(store().usedOn("2026-10-26")).toBe(1);
  });

  test("falls back to zero for broken saved data", async () => {
    const migrate = useGuestAdContinueStore.persist.getOptions().migrate;

    expect(await migrate?.({ dayKey: 5 }, 0)).toEqual({ dayKey: null, used: 0 });
  });
});
