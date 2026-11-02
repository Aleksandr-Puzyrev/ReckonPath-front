import { isVisibleInMatch, kindOfSlot, slotOfKind } from "./kind-slots";

describe("kind slots", () => {
  test("maps a backend kind to the client slot and back", () => {
    expect(slotOfKind("heavy")).toBe("x2");
    expect(kindOfSlot("x2")).toBe("heavy");
  });

  test("gives no slot to a bundle or an unknown kind", () => {
    expect(slotOfKind("bundle")).toBeNull();
    expect(slotOfKind("badge")).toBeNull();
  });

  test("shows every kind in a match except effects (decision 0055 #4)", () => {
    expect(isVisibleInMatch("field")).toBe(true);
    expect(isVisibleInMatch("avatar")).toBe(true);
    expect(isVisibleInMatch("fxClick")).toBe(false);
  });
});
