import { ApiError } from "./api-error";
import { readEmpty } from "./read-empty";

describe("readEmpty", () => {
  test("accepts a successful response without a body", () => {
    expect(() => readEmpty({ response: new Response(null, { status: 204 }) })).not.toThrow();
  });

  test("throws an ApiError with the code of a failed response", () => {
    const read = () =>
      readEmpty({
        error: { error: { code: "MAP_ACTIVE" } },
        response: new Response(null, { status: 409 }),
      });

    expect(read).toThrow(ApiError);
    expect(read).toThrow(expect.objectContaining({ status: 409, code: "MAP_ACTIVE" }));
  });
});
