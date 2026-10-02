import { ApiError } from "./api-error";
import { readData } from "./read-data";

describe("readData", () => {
  test("returns the data of a successful response", () => {
    expect(readData({ data: { a: 1 }, response: new Response(null, { status: 200 }) })).toEqual({
      a: 1,
    });
  });

  test("throws an ApiError with the status and the code of a failed response", () => {
    const read = () =>
      readData({
        error: { error: { code: "NOT_FOUND" } },
        response: new Response(null, { status: 404 }),
      });

    expect(read).toThrow(ApiError);
    expect(read).toThrow(expect.objectContaining({ status: 404, code: "NOT_FOUND" }));
  });
});
