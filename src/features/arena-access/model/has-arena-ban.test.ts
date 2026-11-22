import { hasArenaBan } from "./has-arena-ban";

describe("hasArenaBan", () => {
  test("finds an arena ban among the bans of GET /me (decision 0060 #14)", () => {
    const me = { flags: { deletionScheduledAt: null, bans: [{ scope: "arena" as const }] } };

    expect(hasArenaBan(me)).toBe(true);
  });

  test("ignores the absence of bans and an unknown player", () => {
    expect(hasArenaBan({ flags: { deletionScheduledAt: null } })).toBe(false);
    expect(hasArenaBan(undefined)).toBe(false);
  });
});
