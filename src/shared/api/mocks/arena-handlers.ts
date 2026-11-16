import { http, HttpResponse } from "msw/http";

import { mockArenaMaps } from "./arena-map-handlers";
import {
  arenaHomeMock,
  claimMockPastSeason,
  claimMockStep,
  markMockRulesSeen,
  mockSeason,
} from "./mock-arena";
import { mockUrl } from "./mock-url";

const HTTP_NO_CONTENT = 204;
const HTTP_NOT_FOUND = 404;
const HTTP_CONFLICT = 409;

const errorResponse = (code: string, status: number) =>
  HttpResponse.json({ error: { code } }, { status });

export const arenaHandlers = [
  http.get(mockUrl("/arena"), () => HttpResponse.json(arenaHomeMock(mockArenaMaps()))),
  http.put(mockUrl("/arena/rules-seen"), () => {
    markMockRulesSeen();
    return new HttpResponse(null, { status: HTTP_NO_CONTENT });
  }),
  http.get(mockUrl("/arena/season"), () => HttpResponse.json(mockSeason())),
  http.post(mockUrl("/arena/season/track/:step/claim"), ({ params }) => {
    const claimed = claimMockStep(Number(params.step));
    if (claimed === "step_not_found") return errorResponse(claimed, HTTP_NOT_FOUND);
    if (typeof claimed === "string") return errorResponse(claimed, HTTP_CONFLICT);
    return HttpResponse.json(claimed);
  }),
  http.post(mockUrl("/arena/season/result/claim"), () => {
    const claimed = claimMockPastSeason();
    return claimed === null
      ? errorResponse("no_season_result", HTTP_NOT_FOUND)
      : HttpResponse.json(claimed);
  }),
];
