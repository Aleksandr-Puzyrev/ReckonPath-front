import { http, HttpResponse } from "msw/http";

import type { components } from "../generated/schema";

import { countDailyAttempt } from "./daily-handlers";
import { mockCurrentLevel, mockOverview } from "./mock-campaign";
import { clearMockState, loadMockState, saveMockState } from "./mock-state";
import { mockUrl } from "./mock-url";
import { mockWallet } from "./mock-wallet";

type Attempt = components["schemas"]["Attempt"];
type AttemptsBatch = { attempts: Attempt[] };

const STATE_NAME = "attempts";

interface AttemptsState {
  acceptedIds: string[];
}

let acceptedIds = new Set(
  loadMockState<AttemptsState>(STATE_NAME, { acceptedIds: [] }).acceptedIds,
);

const saveState = () => saveMockState(STATE_NAME, { acceptedIds: [...acceptedIds] });

const accept = (attempt: Attempt) => {
  const { attemptId, mode, claimed } = attempt;
  if (acceptedIds.has(attemptId)) return { attemptId, status: "duplicate" as const };
  acceptedIds.add(attemptId);
  const result = {
    attemptId,
    status: "accepted" as const,
    result: claimed.result,
    stars: claimed.stars,
  };
  if (mode === "campaign") return result;
  const daily = countDailyAttempt(attempt);
  return daily === null ? result : { ...result, ...daily };
};

export const resetMockAttempts = () => {
  acceptedIds = new Set();
  clearMockState(STATE_NAME);
};

// The mock trusts the claimed daily result; the real server replays the taps (мок доверяет заявленному результату дейли; настоящий сервер переигрывает тапы).
export const attemptsHandlers = [
  http.post<never, AttemptsBatch>(mockUrl("/attempts:batch"), async ({ request }) => {
    const { attempts } = await request.json();
    const results = attempts.map(accept);
    saveState();
    return HttpResponse.json({
      results,
      progress: { currentLevel: mockCurrentLevel(), totalStars: mockOverview("ru").stars },
      wallet: mockWallet(),
    });
  }),
];
