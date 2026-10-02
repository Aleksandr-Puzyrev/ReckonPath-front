import { readErrorEnvelope } from "./read-error-envelope";

describe("readErrorEnvelope", () => {
  test("reads the code and details of the envelope", () => {
    expect(
      readErrorEnvelope({ error: { code: "INSUFFICIENT_FUNDS", details: { need: 240 } } }),
    ).toEqual({ code: "INSUFFICIENT_FUNDS", details: { need: 240 } });
  });

  test("keeps the details of a code the contract does not know, without the code", () => {
    expect(readErrorEnvelope({ error: { code: "NEW_CODE", details: { a: 1 } } })).toEqual({
      code: null,
      details: { a: 1 },
    });
  });

  test("returns no code for a body that is not an envelope", () => {
    expect(readErrorEnvelope("busy")).toEqual({ code: null, details: {} });
  });
});
