import { http, HttpResponse } from "msw/http";
import type { JsonBodyType } from "msw";

import {
  findMockLevel,
  isKnownTutorialKey,
  mockCampaignState,
  mockLevelView,
  mockOverview,
  updateMockCampaign,
} from "./mock-campaign";
import type { MockLocale } from "./mock-campaign-content";
import { publicBoardOf } from "./mock-campaign-game";
import {
  continueMockGame,
  getMockGame,
  giveUpMockGame,
  playMockLevel,
  tapMockGame,
} from "./mock-campaign-play";
import type { MockReply } from "./mock-campaign-play";
import { mockUrl } from "./mock-url";

const HTTP_NO_CONTENT = 204;
const HTTP_NOT_FOUND = 404;
const HTTP_UNPROCESSABLE = 422;
const TUTORIAL_KEY = /^[a-z0-9_]{1,40}$/;

const localeOf = (request: Request): MockLocale =>
  request.headers.get("X-Locale")?.startsWith("en") ? "en" : "ru";

const errorResponse = (code: string, status: number, details?: Record<string, unknown>) =>
  HttpResponse.json({ error: { code, ...(details === undefined ? {} : { details }) } }, { status });

const reply = <T extends JsonBodyType>(result: MockReply<T>) =>
  "data" in result
    ? HttpResponse.json(result.data)
    : errorResponse(result.error, result.status, result.details);

const readBody = async (request: Request): Promise<Record<string, unknown>> => {
  try {
    const body: unknown = await request.json();
    return typeof body === "object" && body !== null ? { ...body } : {};
  } catch {
    return {};
  }
};

const numberOf = (value: unknown) => (typeof value === "number" ? value : -1);

export const campaignHandlers = [
  http.get(mockUrl("/campaign"), ({ request }) =>
    HttpResponse.json(mockOverview(localeOf(request))),
  ),
  http.get<{ number: string }>(mockUrl("/campaign/levels/:number"), ({ request, params }) => {
    const level = findMockLevel(Number(params.number));
    if (level === null) return errorResponse("level_not_found", HTTP_NOT_FOUND);
    return HttpResponse.json({
      ...mockLevelView(level, localeOf(request)),
      board: publicBoardOf(level.level),
    });
  }),
  http.post<{ number: string }>(
    mockUrl("/campaign/levels/:number/play"),
    async ({ request, params }) => {
      const body = await readBody(request);
      return reply(playMockLevel(Number(params.number), body.restart === true));
    },
  ),
  http.get<{ id: string }>(mockUrl("/campaign/games/:id"), ({ params }) =>
    reply(getMockGame(params.id)),
  ),
  http.post<{ id: string }>(mockUrl("/campaign/games/:id/tap"), async ({ request, params }) => {
    const body = await readBody(request);
    return reply(
      tapMockGame(params.id, {
        row: numberOf(body.row),
        col: numberOf(body.col),
        seq: numberOf(body.seq),
      }),
    );
  }),
  http.post<{ id: string }>(
    mockUrl("/campaign/games/:id/continue"),
    async ({ request, params }) => {
      const body = await readBody(request);
      return reply(continueMockGame(params.id, numberOf(body.seq)));
    },
  ),
  http.post<{ id: string }>(mockUrl("/campaign/games/:id/give-up"), ({ params }) =>
    reply(giveUpMockGame(params.id)),
  ),
  http.post(mockUrl("/campaign/tutorials"), async ({ request }) => {
    const { key } = await readBody(request);
    if (typeof key !== "string" || !TUTORIAL_KEY.test(key) || !isKnownTutorialKey(key)) {
      return errorResponse("validation_failed", HTTP_UNPROCESSABLE, { fields: { key: "unknown" } });
    }
    const { tutorials } = mockCampaignState();
    if (!tutorials.includes(key)) updateMockCampaign({ tutorials: [...tutorials, key] });
    return new HttpResponse(null, { status: HTTP_NO_CONTENT });
  }),
];
