import { createBackendTransport } from "./backend-transport";

const JSON_HEADERS = { "Content-Type": "application/json" };

const backendReply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

const send = async (reply: Response, body?: unknown) => {
  const requests: Request[] = [];
  const transport = createBackendTransport(async (request) => {
    requests.push(request);
    return reply;
  });
  const response = await transport(
    new Request("https://api.test/api/v1/auth/refresh", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(body ?? {}),
    }),
  );
  return { response, request: requests[0] };
};

describe("createBackendTransport", () => {
  test("sends the request body in snake_case", async () => {
    const { request } = await send(backendReply({ success: true }), { refreshToken: "r" });

    expect(await request?.json()).toEqual({ refresh_token: "r" });
  });

  test("unwraps a success and renames its keys to camelCase", async () => {
    const { response } = await send(
      backendReply({ success: true, data: { access_token: "a", expires_in: 900 } }),
    );

    expect(await response.json()).toEqual({ accessToken: "a", expiresIn: 900 });
  });

  test("turns an empty success into 204", async () => {
    const { response } = await send(backendReply({ success: true }));

    expect(response.status).toBe(204);
  });

  test("treats a null data as an empty success", async () => {
    const { response } = await send(backendReply({ success: true, data: null }));

    expect(response.status).toBe(204);
  });

  test("turns a backend error into the client error with fields and data", async () => {
    const { response } = await send(
      backendReply(
        {
          success: false,
          code: "validation_failed",
          message: "Проверьте поля",
          errors: { accept_terms: "required" },
          data: { resend_after: 30 },
        },
        422,
      ),
    );

    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({
      error: {
        code: "validation_failed",
        message: "Проверьте поля",
        details: { resendAfter: 30, fields: { acceptTerms: "required" } },
      },
    });
  });

  test("passes through a body that is not in the backend shape", async () => {
    const { response } = await send(backendReply({ items: [] }));

    expect(await response.json()).toEqual({ items: [] });
  });
});
