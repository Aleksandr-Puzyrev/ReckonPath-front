import { http, HttpResponse } from "msw/http";
import type { JsonBodyType } from "msw";

import type { MockReply } from "./mock-campaign-play";
import {
  answerMockFriendRequest,
  listMockFriends,
  mockInvite,
  redeemMockInvite,
  removeMockFriend,
  searchMockPlayers,
  sendMockFriendRequest,
  withdrawMockFriendRequest,
} from "./mock-friends";
import { mockUrl } from "./mock-url";

const HTTP_NO_CONTENT = 204;

const reply = <T extends JsonBodyType>(result: MockReply<T>) => {
  if ("data" in result) {
    return result.data === null
      ? new HttpResponse(null, { status: HTTP_NO_CONTENT })
      : HttpResponse.json(result.data);
  }
  return HttpResponse.json(
    {
      error: {
        code: result.error,
        ...(result.details === undefined ? {} : { details: result.details }),
      },
    },
    { status: result.status },
  );
};

const readText = async (request: Request, field: string) => {
  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || !(field in body)) return "";
    const value: unknown = Object.entries(body).find(([key]) => key === field)?.[1];
    return typeof value === "string" ? value : "";
  } catch {
    return "";
  }
};

// Friends and the invite code like the backend: limits, counter-requests, relations and the code rules (друзья и код приглашения как у бэкенда: лимиты, встречные заявки, отношения и правила кода).
export const friendsHandlers = [
  http.get(mockUrl("/friends"), () => HttpResponse.json(listMockFriends())),
  http.get(mockUrl("/friends/search"), ({ request }) =>
    reply(searchMockPlayers(new URL(request.url).searchParams.get("nickname") ?? "")),
  ),
  http.post(mockUrl("/friends/requests"), async ({ request }) =>
    reply(sendMockFriendRequest(await readText(request, "userId"))),
  ),
  http.post<{ id: string }>(mockUrl("/friends/requests/:id/accept"), ({ params }) =>
    reply(answerMockFriendRequest(params.id, true)),
  ),
  http.post<{ id: string }>(mockUrl("/friends/requests/:id/decline"), ({ params }) =>
    reply(answerMockFriendRequest(params.id, false)),
  ),
  http.delete<{ id: string }>(mockUrl("/friends/requests/:id"), ({ params }) =>
    reply(withdrawMockFriendRequest(params.id)),
  ),
  http.delete<{ id: string }>(mockUrl("/friends/:id"), ({ params }) =>
    reply(removeMockFriend(params.id)),
  ),
  http.get(mockUrl("/me/invite"), () => HttpResponse.json(mockInvite())),
  http.post(mockUrl("/me/invite"), async ({ request }) =>
    reply(redeemMockInvite(await readText(request, "code"))),
  ),
];
