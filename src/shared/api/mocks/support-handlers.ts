import { http, HttpResponse } from "msw/http";
import { z } from "zod";

import { mockUrl } from "./mock-url";

const MESSAGE_MAX = 1000;
const APP_VERSION_MAX = 40;
const DEVICE_MAX = 120;
const USER_ID_MAX = 64;
const TICKETS_PER_DAY = 5;
const DAY_MS = 24 * 60 * 60_000;
const HTTP_UNPROCESSABLE = 422;
const HTTP_TOO_MANY = 429;

// Strict like the backend's DisallowUnknownFields (строго, как DisallowUnknownFields бэкенда).
const ticketSchema = z.strictObject({
  topic: z.enum(["ban_appeal", "support"]),
  message: z
    .string()
    .refine((message) => [...message].length <= MESSAGE_MAX && message.trim() !== ""),
  diagnostics: z.strictObject({
    appVersion: z.string().max(APP_VERSION_MAX),
    device: z.string().max(DEVICE_MAX),
    userId: z.string().max(USER_ID_MAX).optional(),
  }),
});

let sentAt: number[] = [];

export const resetMockSupport = () => {
  sentAt = [];
};

const errorOf = (code: string, status: number) =>
  HttpResponse.json({ error: { code } }, { status });

// Tickets like the backend: 5 per rolling day for one account (обращения как у бэкенда: 5 за скользящие сутки на аккаунт).
export const supportHandlers = [
  http.post(mockUrl("/support/tickets"), async ({ request }) => {
    const body = ticketSchema.safeParse(await request.json().catch(() => null));
    if (!body.success) return errorOf("validation_failed", HTTP_UNPROCESSABLE);
    const now = Date.now();
    sentAt = sentAt.filter((time) => now - time < DAY_MS);
    if (sentAt.length >= TICKETS_PER_DAY) return errorOf("tickets_limit", HTTP_TOO_MANY);
    sentAt.push(now);
    return HttpResponse.json({ ticketId: `ticket_${sentAt.length}_${now}` });
  }),
];
