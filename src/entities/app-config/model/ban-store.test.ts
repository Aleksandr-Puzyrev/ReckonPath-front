import { useBanStore } from "./ban-store";

describe("useBanStore", () => {
  test("keeps a full ban until reset", () => {
    const ban = { scope: "all" as const, until: null, reason: "" };

    useBanStore.getState().setBan(ban);
    expect(useBanStore.getState().ban).toEqual(ban);
    useBanStore.getState().reset();

    expect(useBanStore.getState().ban).toBeNull();
  });
});
