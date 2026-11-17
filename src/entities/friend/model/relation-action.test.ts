import { relationActionOf } from "./relation-action";

describe("relationActionOf (decision 0062 #11)", () => {
  test("offers to add a stranger", () => {
    expect(relationActionOf("none")).toBe("add");
  });

  test("shows a sent request", () => {
    expect(relationActionOf("outgoing")).toBe("sent");
  });

  test("offers to accept a player who has asked me", () => {
    expect(relationActionOf("incoming")).toBe("accept");
  });

  test("marks a friend", () => {
    expect(relationActionOf("friend")).toBe("friend");
  });

  test("offers nothing for a blocked player", () => {
    expect(relationActionOf("blocked")).toBe("none");
  });
});
