import { useDailyRecordStore } from "./daily-record-store";

const store = () => useDailyRecordStore.getState();

const counted = (attemptId: string) => ({
  attemptId,
  result: "won" as const,
  movesUsed: 7,
  stars: 3,
  durationMs: 84_000,
});

afterEach(() => store().reset());

describe("useDailyRecordStore", () => {
  test("keeps the first attempt of the day as the counted one", () => {
    store().recordCounted("2026-09-26", counted("first"));
    store().recordCounted("2026-09-26", counted("replay"));

    expect(store().days["2026-09-26"]).toMatchObject({ attemptId: "first", rank: null });
  });

  test("adds the server's place to the counted attempt", () => {
    store().recordCounted("2026-09-26", counted("first"));

    store().recordPlace("first", { rank: 134, percentile: 88, ranked: true });

    expect(store().days["2026-09-26"]).toMatchObject({ rank: 134, percentile: 88, ranked: true });
  });

  test("ignores the place of an attempt that is not counted", () => {
    store().recordCounted("2026-09-26", counted("first"));

    store().recordPlace("replay", { rank: 1, percentile: 99, ranked: true });

    expect(store().days["2026-09-26"]?.rank).toBeNull();
  });

  test("keeps only the recent days", () => {
    Array.from({ length: 45 }, (_, day) =>
      store().recordCounted(`2026-08-${String(day + 1).padStart(2, "0")}`, counted(`a${day}`)),
    );

    expect(Object.keys(store().days)).toHaveLength(40);
  });

  test("keeps version 1 records with an unknown ranked flag", async () => {
    const migrate = useDailyRecordStore.persist.getOptions().migrate;
    const v1 = { ...counted("first"), rank: 134, percentile: 88 };

    expect(await migrate?.({ days: { "2026-09-26": v1 } }, 1)).toEqual({
      days: { "2026-09-26": { ...v1, ranked: null } },
    });
  });

  test("drops a broken saved record on migration", async () => {
    const migrate = useDailyRecordStore.persist.getOptions().migrate;

    expect(await migrate?.({ days: { "2026-09-26": { attemptId: 1 } } }, 0)).toEqual({ days: {} });
  });
});
