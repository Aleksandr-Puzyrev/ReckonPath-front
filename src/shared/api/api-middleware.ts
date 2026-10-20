import type { Middleware } from "openapi-fetch";
import { Platform } from "react-native";
import { uuidv7 } from "uuidv7";

import { APP_VERSION } from "@shared/config";
import { i18n } from "@shared/i18n";

import { readErrorEnvelope } from "./read-error-envelope";
import { emitSystemSignal } from "./system-signals";

const WRITE_METHODS: ReadonlySet<string> = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const HTTP_UPGRADE_REQUIRED = 426;
const HTTP_FORBIDDEN = 403;
const HTTP_SERVICE_UNAVAILABLE = 503;

const envelopeOf = async (response: Response) => {
  try {
    return readErrorEnvelope(await response.clone().json());
  } catch {
    return null;
  }
};

export const apiMiddleware: Middleware = {
  onRequest: ({ request }) => {
    request.headers.set("X-App-Version", APP_VERSION);
    request.headers.set("X-Platform", Platform.OS);
    request.headers.set("X-Locale", i18n.language);
    request.headers.set("X-Request-Id", uuidv7());
    // A key passed by the action is kept, so its retries stay idempotent (ключ, переданный действием, сохраняется, чтобы его повторы оставались идемпотентными).
    if (WRITE_METHODS.has(request.method) && !request.headers.has("Idempotency-Key")) {
      request.headers.set("Idempotency-Key", uuidv7());
    }
    return request;
  },
  onResponse: async ({ response }) => {
    if (response.status === HTTP_UPGRADE_REQUIRED) emitSystemSignal("upgradeRequired");
    if (response.status !== HTTP_SERVICE_UNAVAILABLE && response.status !== HTTP_FORBIDDEN) {
      return response;
    }
    const envelope = await envelopeOf(response);
    if (response.status === HTTP_SERVICE_UNAVAILABLE && envelope?.code === "MAINTENANCE") {
      emitSystemSignal("maintenance");
    }
    if (response.status === HTTP_FORBIDDEN && envelope?.code === "BANNED") {
      emitSystemSignal("banned", envelope.details);
    }
    return response;
  },
};
