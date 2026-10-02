import { http, HttpResponse } from "msw/http";

import type { components } from "../generated/schema";

import { countDailyAttempt } from "./daily-handlers";
import { clearMockState, loadMockState, saveMockState } from "./mock-state";
import { mockUrl } from "./mock-url";

type Attempt = components["schemas"]["Attempt"];
type AttemptsBatch = { attempts: Attempt[] };
type LevelBest = { id: string; bestStars: number; bestMoves: number };

const WALLET = { emeralds: 0, coins: 0 };

const STATE_NAME = "attempts";

interface AttemptsState {
  acceptedIds: string[];
  best: [string, LevelBest][];
}

const saved = loadMockState<AttemptsState>(STATE_NAME, { acceptedIds: [], best: [] });
let acceptedIds = new Set(saved.acceptedIds);
let bestByLevel = new Map(saved.best);

const saveState = () =>
  saveMockState(STATE_NAME, { acceptedIds: [...acceptedIds], best: [...bestByLevel.entries()] });

const isBetter = (stars: number, moves: number, previous: LevelBest | undefined) =>
  previous === undefined ||
  stars > previous.bestStars ||
  (stars === previous.bestStars && moves < previous.bestMoves);

const acceptCampaign = ({ ref, claimed }: Attempt) => {
  const stars = claimed.stars ?? 0;
  if (claimed.result === "won" && isBetter(stars, claimed.movesUsed, bestByLevel.get(ref))) {
    bestByLevel.set(ref, { id: ref, bestStars: stars, bestMoves: claimed.movesUsed });
  }
};

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
  if (mode === "campaign") {
    acceptCampaign(attempt);
    return result;
  }
  const daily = countDailyAttempt(attempt);
  return daily === null ? result : { ...result, ...daily };
};

const totalStars = () =>
  [...bestByLevel.values()].reduce((total, { bestStars }) => total + bestStars, 0);

export const resetMockAttempts = () => {
  acceptedIds = new Set();
  bestByLevel = new Map();
  clearMockState(STATE_NAME);
};

// The mock trusts the claimed result; the real server replays the taps (мок доверяет заявленному результату; настоящий сервер переигрывает тапы).
export const attemptsHandlers = [
  http.post<never, AttemptsBatch>(mockUrl("/attempts:batch"), async ({ request }) => {
    const { attempts } = await request.json();
    const results = attempts.map(accept);
    saveState();
    return HttpResponse.json({
      results,
      progress: { currentLevel: bestByLevel.size + 1, totalStars: totalStars() },
      wallet: WALLET,
    });
  }),
  http.get(mockUrl("/progress"), () =>
    HttpResponse.json({
      currentLevel: bestByLevel.size + 1,
      levels: [...bestByLevel.values()],
      worldsCompleted: [],
    }),
  ),
];
