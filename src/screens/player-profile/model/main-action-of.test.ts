import { mainActionOf } from "./main-action-of";

describe("mainActionOf", () => {
  test("offers the action that fits my relation to the player (decision 0066 #11)", () => {
    expect(mainActionOf("none")).toBe("add");
    expect(mainActionOf("outgoing")).toBe("sent");
    expect(mainActionOf("incoming")).toBe("accept");
    expect(mainActionOf("friend")).toBe("challenge");
    expect(mainActionOf("blocked")).toBe("unblock");
  });

  test("offers nothing on my own profile", () => {
    expect(mainActionOf("self")).toBeNull();
  });
});
