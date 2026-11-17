import { canRedeemInvite } from "./can-redeem-invite";

const INVITE = { code: "K7M2QX9A", invited: 0, rewarded: 0, rewardGems: 20, limit: 50 };

describe("canRedeemInvite (decision 0062 #2)", () => {
  test("allows a code while none has been entered", () => {
    expect(canRedeemInvite(INVITE)).toBe(true);
  });

  test("hides the field once a code has been entered", () => {
    expect(canRedeemInvite({ ...INVITE, invitedBy: "mock-2" })).toBe(false);
  });

  test("hides the field until the invite is known", () => {
    expect(canRedeemInvite(undefined)).toBe(false);
  });
});
