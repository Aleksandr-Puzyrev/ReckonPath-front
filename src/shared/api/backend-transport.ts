import { z } from "zod";

import { toCamelKeys, toSnakeKeys } from "@shared/lib";

import type { Transport } from "./api-fetch";

const HTTP_NO_CONTENT = 204;

const backendBodySchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true), data: z.unknown().optional() }),
  z.object({
    success: z.literal(false),
    code: z.string(),
    message: z.string().optional(),
    errors: z.record(z.string(), z.unknown()).optional(),
    data: z.unknown().optional(),
  }),
]);

type BackendBody = z.infer<typeof backendBodySchema>;

const isJson = (headers: Headers) =>
  headers.get("Content-Type")?.includes("application/json") ?? false;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readJson = async (message: Request | Response): Promise<unknown> => {
  try {
    return await message.clone().json();
  } catch {
    return undefined;
  }
};

const toBackendRequest = async (request: Request) => {
  if (!isJson(request.headers)) return request;
  const body = await readJson(request);
  if (body === undefined) return request;
  return new Request(request, { body: JSON.stringify(toSnakeKeys(body)) });
};

const clientBodyOf = (body: BackendBody) => {
  if (body.success) return body.data === undefined ? null : toCamelKeys(body.data);
  const fields = body.errors === undefined ? {} : { fields: body.errors };
  const details = { ...(isRecord(body.data) ? body.data : {}), ...fields };
  return { error: { code: body.code, message: body.message, details: toCamelKeys(details) } };
};

const toClientResponse = async (response: Response) => {
  if (!isJson(response.headers)) return response;
  const parsed = backendBodySchema.safeParse(await readJson(response));
  if (!parsed.success) return response;
  const headers = new Headers(response.headers);
  headers.delete("Content-Length");
  const body = clientBodyOf(parsed.data);
  // An empty success becomes 204, the only status openapi-fetch reads without a body (пустой успех становится 204 — единственным статусом, который openapi-fetch читает без тела).
  if (body === null) return new Response(null, { status: HTTP_NO_CONTENT, headers });
  return new Response(JSON.stringify(body), { status: response.status, headers });
};

export const createBackendTransport =
  (transport: Transport): Transport =>
  async (request) =>
    toClientResponse(await transport(await toBackendRequest(request)));
