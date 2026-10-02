import { useProgressStore } from "./progress-store";

const store = () => useProgressStore.getState();

describe("useProgressStore", () => {
  beforeEach(() => store().reset());

  test("replaces the best results with the reconciled ones", () => {
    store().recordWin("c-1", { stars: 3, moves: 5 });

    store().replaceBest({ "c-2": { stars: 1, moves: 9 } });

    expect(store().best).toEqual({ "c-2": { stars: 1, moves: 9 } });
  });

  test("keeps the first win without calling it a record", () => {
    expect(store().recordWin("c-1", { stars: 2, moves: 9 })).toBe(false);
    expect(store().best["c-1"]).toEqual({ stars: 2, moves: 9 });
  });

  test("calls more stars a record", () => {
    store().recordWin("c-1", { stars: 2, moves: 9 });
    expect(store().recordWin("c-1", { stars: 3, moves: 10 })).toBe(true);
    expect(store().best["c-1"]).toEqual({ stars: 3, moves: 10 });
  });

  test("calls fewer moves with the same stars a record", () => {
    store().recordWin("c-1", { stars: 3, moves: 8 });
    expect(store().recordWin("c-1", { stars: 3, moves: 7 })).toBe(true);
  });

  test("keeps the best result after a worse win", () => {
    store().recordWin("c-1", { stars: 3, moves: 7 });
    expect(store().recordWin("c-1", { stars: 1, moves: 12 })).toBe(false);
    expect(store().best["c-1"]).toEqual({ stars: 3, moves: 7 });
  });

  test("drops corrupt saved progress on migration", () => {
    const { migrate } = useProgressStore.persist.getOptions();
    expect(migrate?.({ best: { "c-1": { stars: 7 } } }, 0)).toEqual({ best: {} });
    expect(migrate?.({ best: { "c-1": { stars: 3, moves: 5 } } }, 0)).toEqual({
      best: { "c-1": { stars: 3, moves: 5 } },
    });
  });
});
