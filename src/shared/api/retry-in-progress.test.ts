import { retryInProgress } from "./retry-in-progress";

const URL = "https://api.test/v1/shop/items/reef/buy";

const errorResponse = (code: string, status: number) =>
  new Response(JSON.stringify({ error: { code } }), {
    status,
    headers: { "Content-Type": "application/json", "Retry-After": "0" },
  });

const purchase = () =>
  new Request(URL, {
    method: "POST",
    headers: { "Idempotency-Key": "key-1" },
    body: JSON.stringify({ price: 480 }),
  });

describe("retryInProgress", () => {
  test("repeats the request with the same key while the first one runs", async () => {
    const keys: (string | null)[] = [];
    const transport = jest.fn(async (request: Request) => {
      keys.push(request.headers.get("Idempotency-Key"));
      return keys.length === 1
        ? errorResponse("idempotency_in_progress", 409)
        : new Response(JSON.stringify({ ok: true }), { status: 200 });
    });

    const response = await retryInProgress(transport)(purchase());

    expect(response.status).toBe(200);
    expect(keys).toEqual(["key-1", "key-1"]);
  });

  test("repeats only once", async () => {
    const transport = jest.fn(async () => errorResponse("idempotency_in_progress", 409));

    const response = await retryInProgress(transport)(purchase());

    expect(response.status).toBe(409);
    expect(transport).toHaveBeenCalledTimes(2);
  });

  test("passes other conflicts through", async () => {
    const transport = jest.fn(async () => errorResponse("price_changed", 409));

    await retryInProgress(transport)(purchase());

    expect(transport).toHaveBeenCalledTimes(1);
  });
});
