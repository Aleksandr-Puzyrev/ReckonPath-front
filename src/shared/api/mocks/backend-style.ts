import { z } from "zod";

import { toCamelKeys, toSnakeKeys } from "@shared/lib";

import type { Transport } from "../api-fetch";

const HTTP_OK = 200;
const HTTP_NO_CONTENT = 204;
const API_PATH = "/v1/";

const clientErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string().optional(),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
});

const isJson = (headers: Headers) =>
  headers.get("Content-Type")?.includes("application/json") ?? false;

const jsonResponse = (body: unknown, status: number, source: Headers) => {
  const headers = new Headers(source);
  headers.set("Content-Type", "application/json");
  headers.delete("Content-Length");
  headers.set("Date", new Date().toUTCString());
  return new Response(JSON.stringify(body), { status, headers });
};

const toClientRequest = async (request: Request) => {
  if (!isJson(request.headers)) return request;
  const body = JSON.stringify(toCamelKeys(await request.clone().json()));
  return new Request(request, { body });
};

const backendErrorOf = (body: unknown) => {
  const parsed = clientErrorSchema.safeParse(body);
  if (!parsed.success) return { success: false, code: "internal_error", message: "" };
  const { code, message = code, details = {} } = parsed.data.error;
  const { fields, ...data } = details;
  const errors = fields === undefined ? {} : { errors: toSnakeKeys(fields) };
  return { success: false, code, message, ...errors, data: toSnakeKeys(data) };
};

const toBackendResponse = async (response: Response) => {
  if (response.status === HTTP_NO_CONTENT) {
    return jsonResponse({ success: true }, HTTP_OK, response.headers);
  }
  if (!isJson(response.headers)) return response;
  const body: unknown = await response.json();
  if (!response.ok) return jsonResponse(backendErrorOf(body), response.status, response.headers);
  return jsonResponse(
    { success: true, data: toSnakeKeys(body) },
    response.status,
    response.headers,
  );
};

// The mocks keep answering in the client's own shape; this layer turns them into the backend's style, so every test runs the real conversion (моки отвечают в форме клиента; этот слой переводит их в стиль бэкенда, чтобы каждый тест проходил настоящее преобразование).
export const serveBackendStyle =
  (respond: Transport): Transport =>
  async (request) => {
    if (!new URL(request.url).pathname.includes(API_PATH)) return respond(request);
    return toBackendResponse(await respond(await toClientRequest(request)));
  };
