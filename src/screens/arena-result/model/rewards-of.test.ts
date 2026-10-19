import { rewardsOf } from "./rewards-of";

const end = (rp: number, rewards: Record<string, unknown>[]) =>
  ({ rp, rewards }) as unknown as Parameters<typeof rewardsOf>[0];

describe("rewardsOf", () => {
  test("lists RP, coins, emeralds and experience of a win (PVP-22, PVP-25)", () => {
    expect(
      rewardsOf(
        end(10, [{ currency: "coin", amount: 40 }, { currency: "emerald", amount: 3 }, { xp: 10 }]),
      ),
    ).toEqual([
      { kind: "rp", amount: 10 },
      { kind: "coin", amount: 40 },
      { kind: "emerald", amount: 3 },
      { kind: "xp", amount: 10 },
    ]);
  });

  test("skips rewards it does not know", () => {
    expect(rewardsOf(end(0, [{ item: "season_frame" }]))).toEqual([]);
  });
});
