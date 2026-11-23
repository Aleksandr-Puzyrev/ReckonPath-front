import { http, HttpResponse } from "msw/http";
import type { JsonBodyType } from "msw";

import type { MockReply } from "./mock-campaign-play";
import {
  blockMockPlayer,
  listMockBlocks,
  reportMockPlayer,
  unblockMockPlayer,
} from "./mock-friends";
import { mockPlayerProfile } from "./mock-player-profiles";
import { mockUrl } from "./mock-url";

const HTTP_NO_CONTENT = 204;

const reply = <T extends JsonBodyType>(result: MockReply<T>) => {
  if ("data" in result) {
    return result.data === null
      ? new HttpResponse(null, { status: HTTP_NO_CONTENT })
      : HttpResponse.json(result.data);
  }
  return HttpResponse.json({ error: { code: result.error } }, { status: result.status });
};

const readReason = async (request: Request) => {
  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || !("reason" in body)) return "";
    return typeof body.reason === "string" ? body.reason : "";
  } catch {
    return "";
  }
};

// Another player's profile, block and report like the backend (профиль другого игрока, блокировка и жалоба как у бэкенда).
export const playerHandlers = [
  http.get<{ id: string }>(mockUrl("/arena/players/:id"), ({ params }) =>
    reply(mockPlayerProfile(params.id)),
  ),
  http.post<{ id: string }>(mockUrl("/users/:id/block"), ({ params }) =>
    reply(blockMockPlayer(params.id)),
  ),
  http.delete<{ id: string }>(mockUrl("/users/:id/block"), ({ params }) =>
    reply(unblockMockPlayer(params.id)),
  ),
  http.post<{ id: string }>(mockUrl("/users/:id/report"), async ({ params, request }) =>
    reply(reportMockPlayer(params.id, await readReason(request))),
  ),
  http.get(mockUrl("/me/blocks"), () => HttpResponse.json(listMockBlocks())),
];
