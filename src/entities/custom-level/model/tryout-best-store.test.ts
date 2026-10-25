import { useTryoutBestStore } from "./tryout-best-store";

const store = () => useTryoutBestStore.getState();

describe("useTryoutBestStore", () => {
  beforeEach(() => store().reset());

  test("keeps the best tryout result of a level (decision 0044 #1)", () => {
    store().record("RP2-a", 9);
    store().record("RP2-a", 11);
    store().record("RP2-a", 7);

    expect(store().best).toEqual({ "RP2-a": 7 });
  });

  test("keeps only the latest levels", () => {
    for (let index = 0; index < 45; index += 1) store().record(`RP2-${index}`, 5);

    expect(Object.keys(store().best)).toHaveLength(40);
    expect(store().best["RP2-0"]).toBeUndefined();
  });

  test("falls back to no results on corrupt data", () => {
    const { migrate } = useTryoutBestStore.persist.getOptions();

    expect(migrate?.({ best: { a: "x" } }, 0)).toEqual({ best: {} });
  });
});
