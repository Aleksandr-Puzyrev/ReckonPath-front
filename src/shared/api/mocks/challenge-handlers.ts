import { http, HttpResponse } from "msw/http";
import type { JsonBodyType } from "msw";

import type { MockReply } from "./mock-campaign-play";
import {
  acceptMockChallenge,
  closeMockChallenge,
  listMockChallenges,
  sendMockChallenge,
} from "./mock-challenges";
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

// Friend challenges like the backend: one pending challenge of mine and a friendly match on accept; tests inject the pushes through the socket stand-in (вызовы друзей как у бэкенда: один мой ожидающий вызов и дружеский матч при принятии; пуши тесты подают через заменитель сокета).
export const challengeHandlers = [
  http.post<{ id: string }>(mockUrl("/friends/:id/challenge"), ({ params }) =>
    reply(sendMockChallenge(params.id)),
  ),
  http.get(mockUrl("/arena/challenges"), () => HttpResponse.json(listMockChallenges())),
  http.post<{ id: string }>(mockUrl("/arena/challenges/:id/accept"), ({ params }) =>
    reply(acceptMockChallenge(params.id)),
  ),
  http.post<{ id: string }>(mockUrl("/arena/challenges/:id/decline"), ({ params }) =>
    reply(closeMockChallenge(params.id, true)),
  ),
  http.delete<{ id: string }>(mockUrl("/arena/challenges/:id"), ({ params }) =>
    reply(closeMockChallenge(params.id, false)),
  ),
];
