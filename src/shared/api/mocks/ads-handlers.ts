import { http, HttpResponse } from "msw/http";
import { z } from "zod";

import type { components } from "../generated/schema";

import { mockUrl } from "./mock-url";
import { creditEmeralds, mockWallet } from "./mock-wallet";

type Placement = components["schemas"]["AdPlacement"];

const DAY_MS = 86_400_000;
const INTENT_TTL_MS = 15 * 60_000;
const GEMS_REWARD = 5;
const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const HTTP_UNPROCESSABLE = 422;
// Remote-config defaults of Part 6 §7.4; streak and event have none there, one and five are mock choices (значения remote config из Части 6 §7.4; для серии и события их нет, один и пять — выбор мока).
const DAILY_LIMITS: Record<Placement, number> = {
  gems: 5,
  continue: 2,
  double: 5,
  streak: 1,
  event: 5,
};

interface Intent {
  placement: Placement;
  createdAt: number;
  isRewarded: boolean;
}

const intentSchema = z.object({
  placement: z.enum(["gems", "continue", "double", "streak", "event"]),
  ref: z.string().optional(),
});

let intents = new Map<string, Intent>();
let used: Partial<Record<Placement, { day: number; count: number }>> = {};
let intentCount = 0;

export const resetMockAds = () => {
  intents = new Map();
  used = {};
  intentCount = 0;
};

const dayOf = (now: number) => Math.floor(now / DAY_MS);

const usedToday = (placement: Placement, now: number) => {
  const record = used[placement];
  return record === undefined || record.day !== dayOf(now) ? 0 : record.count;
};

const resetAtOf = (now: number) => new Date((dayOf(now) + 1) * DAY_MS).toISOString();

const limitOf = (placement: Placement, now: number) => ({
  used: usedToday(placement, now),
  max: DAILY_LIMITS[placement],
  resetAt: resetAtOf(now),
});

// The mock plays the network's SSV callback: the first poll after the ad credits the reward once (мок играет роль SSV-колбэка сети: первый опрос после рекламы начисляет награду один раз).
const reward = (intent: Intent, now: number) => {
  if (intent.isRewarded) return;
  intent.isRewarded = true;
  used[intent.placement] = { day: dayOf(now), count: usedToday(intent.placement, now) + 1 };
  if (intent.placement === "gems") creditEmeralds(GEMS_REWARD);
};

export const adsHandlers = [
  http.get(mockUrl("/ads/limits"), () => {
    const now = Date.now();
    return HttpResponse.json({
      gems: limitOf("gems", now),
      continue: limitOf("continue", now),
      streak: limitOf("streak", now),
    });
  }),
  http.post(mockUrl("/ads/intent"), async ({ request }) => {
    const body = intentSchema.safeParse(await request.json().catch(() => null));
    if (!body.success) {
      return HttpResponse.json({ error: { code: "VALIDATION" } }, { status: HTTP_BAD_REQUEST });
    }
    const { placement } = body.data;
    const now = Date.now();
    const left = DAILY_LIMITS[placement] - usedToday(placement, now);
    if (left <= 0) {
      return HttpResponse.json(
        { error: { code: "LIMIT_REACHED", details: { kind: placement, resetAt: resetAtOf(now) } } },
        { status: HTTP_UNPROCESSABLE },
      );
    }
    intentCount += 1;
    const adIntentId = `intent_${intentCount}`;
    intents.set(adIntentId, { placement, createdAt: now, isRewarded: false });
    return HttpResponse.json({
      adIntentId,
      customData: adIntentId,
      network: "mock",
      unitId: `mock-${placement}`,
      leftToday: left,
    });
  }),
  http.get(mockUrl("/ads/intent/:id"), ({ params }) => {
    const intent = intents.get(String(params.id));
    if (intent === undefined) {
      return HttpResponse.json({ error: { code: "NOT_FOUND" } }, { status: HTTP_NOT_FOUND });
    }
    const now = Date.now();
    if (!intent.isRewarded && now - intent.createdAt > INTENT_TTL_MS) {
      return HttpResponse.json({ status: "expired" });
    }
    reward(intent, now);
    return HttpResponse.json({
      status: "rewarded",
      ...(intent.placement === "gems"
        ? { reward: { currency: "emerald", amount: GEMS_REWARD } }
        : {}),
      wallet: mockWallet(),
    });
  }),
];
