import { http, HttpResponse } from "msw/http";
import { z } from "zod";

import type { components } from "../generated/schema";

import { mockActiveMapId } from "./arena-map-handlers";
import { mockPassedLevels } from "./attempts-handlers";
import { ARENA_FORMAT } from "./mock-arena-format";
import {
  claimMockStep,
  mockArenaProfile,
  mockMatchHistory,
  mockSeasonTrack,
} from "./mock-arena-profile";
import { mockWallet } from "./mock-wallet";
import { mockUrl } from "./mock-url";

type Arena = components["schemas"]["Arena"];

const ARENA_UNLOCK_LEVEL = 12;
const SEASON_DAYS = 28;
const DAY_MS = 86_400_000;
const HISTORY_PAGE = 20;
const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;

const claimSchema = z.object({ step: z.number().int() });

export const arenaMock = (now = Date.now()): Arena => ({
  profile: mockArenaProfile(),
  season: {
    id: 1,
    endsAt: new Date(now + SEASON_DAYS * DAY_MS).toISOString(),
    track: mockSeasonTrack(),
  },
  format: ARENA_FORMAT,
  activeMapId: mockActiveMapId(),
  unlocked: mockPassedLevels() >= ARENA_UNLOCK_LEVEL,
  onboardingDone: false,
});

const summaryOf = ({
  maps: _maps,
  taps: _taps,
  ...summary
}: components["schemas"]["MatchDetails"]) => summary;

export const arenaHandlers = [
  http.get(mockUrl("/arena"), () => HttpResponse.json(arenaMock())),
  http.get(mockUrl("/arena/matches"), ({ request }) => {
    const start = Number(new URL(request.url).searchParams.get("cursor") ?? 0);
    const history = mockMatchHistory();
    const end = start + HISTORY_PAGE;
    return HttpResponse.json({
      items: history.slice(start, end).map(summaryOf),
      nextCursor: end < history.length ? String(end) : null,
    });
  }),
  http.get(mockUrl("/arena/matches/:id"), ({ params }) => {
    const match = mockMatchHistory().find(({ matchId }) => matchId === String(params.id));
    return match === undefined
      ? HttpResponse.json({ error: { code: "NOT_FOUND" } }, { status: HTTP_NOT_FOUND })
      : HttpResponse.json(match);
  }),
  http.post(mockUrl("/arena/season/claim"), async ({ request }) => {
    const body = claimSchema.safeParse(await request.json().catch(() => null));
    const claimed = body.success ? claimMockStep(body.data.step) : null;
    if (claimed === null) {
      return HttpResponse.json({ error: { code: "VALIDATION" } }, { status: HTTP_BAD_REQUEST });
    }
    return HttpResponse.json({ ...claimed, wallet: mockWallet() });
  }),
];
