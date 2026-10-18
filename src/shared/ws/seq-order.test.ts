import { checkSeq } from "./seq-order";

describe("checkSeq", () => {
  test("delivers the next message in order", () => {
    expect(checkSeq(4, 5)).toBe("deliver");
  });

  test("delivers the first message and messages without seq", () => {
    expect(checkSeq(null, 9)).toBe("deliver");
    expect(checkSeq(4, undefined)).toBe("deliver");
  });

  test("drops a repeated message", () => {
    expect(checkSeq(4, 4)).toBe("stale");
  });

  test("reports a gap, which asks for a resync (Part 8 §9.2)", () => {
    expect(checkSeq(4, 6)).toBe("gap");
  });
});
