import { serveBackendStyle } from "./backend-style";

const JSON_HEADERS = { "Content-Type": "application/json" };
const API_URL = "https://mock.test/v1/me";

const serve = async (reply: Response, url = API_URL) => {
  const requests: Request[] = [];
  const response = await serveBackendStyle(async (request) => {
    requests.push(request);
    return reply;
  })(
    new Request(url, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ confirm_nickname: "Nova" }),
    }),
  );
  return { response, request: requests[0] };
};

describe("serveBackendStyle", () => {
  test("hands the mock handlers a camelCase body", async () => {
    const { request } = await serve(new Response(null, { status: 204 }));

    expect(await request?.json()).toEqual({ confirmNickname: "Nova" });
  });

  test("wraps a mock answer in the backend envelope with snake_case keys", async () => {
    const { response } = await serve(
      new Response(JSON.stringify({ deletionScheduledAt: "2026-11-24T00:00:00Z" }), {
        headers: JSON_HEADERS,
      }),
    );

    expect(await response.json()).toEqual({
      success: true,
      data: { deletion_scheduled_at: "2026-11-24T00:00:00Z" },
    });
    expect(response.headers.has("Date")).toBe(true);
  });

  test("answers an empty mock reply like the backend does", async () => {
    const { response } = await serve(new Response(null, { status: 204 }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
  });

  test("turns a mock error into the backend error", async () => {
    const { response } = await serve(
      new Response(
        JSON.stringify({
          error: { code: "nick_taken", details: { fields: { nickName: "taken" }, retryIn: 3 } },
        }),
        { status: 409, headers: JSON_HEADERS },
      ),
    );

    expect(await response.json()).toEqual({
      success: false,
      code: "nick_taken",
      message: "nick_taken",
      errors: { nick_name: "taken" },
      data: { retry_in: 3 },
    });
  });

  test("leaves requests outside the API alone", async () => {
    const asset = new Response(JSON.stringify({ name: "ocean" }), { headers: JSON_HEADERS });
    const { response } = await serve(asset, "https://mock.test/cdn/skins/ocean.json");

    expect(await response.json()).toEqual({ name: "ocean" });
  });
});
