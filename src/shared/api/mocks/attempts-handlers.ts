import { http, HttpResponse } from "msw/http";

import type { components } from "../generated/schema";

import { mockUrl } from "./mock-url";

type Attempt = components["schemas"]["Attempt"];
type AttemptsBatch = { attempts: Attempt[] };
type LevelBest = { id: string; bestStars: number; bestMoves: number };

const WALLET = { emeralds: 0, coins: 0 };

let acceptedIds = new Set<string>();
let bestByLevel = new Map<string, LevelBest>();

const isBetter = (stars: number, moves: number, previous: LevelBest | undefined) =>
  previous === undefined ||
  stars > previous.bestStars ||
  (stars === previous.bestStars && moves < previous.bestMoves);

const accept = ({ attemptId, ref, claimed }: Attempt) => {
  if (acceptedIds.has(attemptId)) return { attemptId, status: "duplicate" as const };
  acceptedIds.add(attemptId);
  const stars = claimed.stars ?? 0;
  if (claimed.result === "won" && isBetter(stars, claimed.movesUsed, bestByLevel.get(ref))) {
    bestByLevel.set(ref, { id: ref, bestStars: stars, bestMoves: claimed.movesUsed });
  }
  return { attemptId, status: "accepted" as const, result: claimed.result, stars: claimed.stars };
};

const totalStars = () =>
  [...bestByLevel.values()].reduce((total, { bestStars }) => total + bestStars, 0);

export const resetMockAttempts = () => {
  acceptedIds = new Set();
  bestByLevel = new Map();
};

// The mock trusts the claimed result; the real server replays the taps (мок доверяет заявленному результату; настоящий сервер переигрывает тапы).
export const attemptsHandlers = [
  http.post<never, AttemptsBatch>(mockUrl("/attempts:batch"), async ({ request }) => {
    const { attempts } = await request.json();
    const results = attempts.map(accept);
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
