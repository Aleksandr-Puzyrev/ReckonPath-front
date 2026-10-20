import { http, HttpResponse } from "msw/http";
import { z } from "zod";

import { mockUrl } from "./mock-url";

const MESSAGE_MAX = 1000;
const HTTP_BAD_REQUEST = 400;

const ticketSchema = z.object({
  topic: z.string().min(1),
  message: z.string().min(1).max(MESSAGE_MAX),
  diagnostics: z.object({ appVersion: z.string(), device: z.string(), userId: z.string() }),
});

let count = 0;

export const resetMockSupport = () => {
  count = 0;
};

export const supportHandlers = [
  http.post(mockUrl("/support/tickets"), async ({ request }) => {
    const body = ticketSchema.safeParse(await request.json().catch(() => null));
    if (!body.success) {
      return HttpResponse.json({ error: { code: "VALIDATION" } }, { status: HTTP_BAD_REQUEST });
    }
    count += 1;
    return HttpResponse.json({ ticketId: `ticket_${count}` });
  }),
];
