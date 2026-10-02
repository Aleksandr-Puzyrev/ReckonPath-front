import { http, HttpResponse } from "msw/http";

import { APP_VERSION } from "@shared/config";

import type { components } from "../generated/schema";

import { attemptsHandlers } from "./attempts-handlers";
import { authHandlers } from "./auth-handlers";
import { mockUrl } from "./mock-url";

type Bootstrap = components["schemas"]["Bootstrap"];

const DAY_MS = 86_400_000;
const DATE_LENGTH = 10;

const startOfNextUtcDay = (now: Date) => new Date(Math.ceil(now.getTime() / DAY_MS) * DAY_MS);

export const bootstrapMock = (now = new Date()): Bootstrap => ({
  serverTime: now.toISOString(),
  version: {
    min: APP_VERSION,
    recommended: APP_VERSION,
    storeUrl: "https://apps.apple.com/app/id000",
  },
  maintenance: null,
  config: { "arena.maxTurns": 40, "ads.interstitial.everyN": 3, "features.events": true },
  contentVersion: "2026.09.20-1",
  adsNetwork: "yandex",
  dayKey: now.toISOString().slice(0, DATE_LENGTH),
  nextDayAt: startOfNextUtcDay(now).toISOString(),
});

export const handlers = [
  http.get(mockUrl("/bootstrap"), () => HttpResponse.json(bootstrapMock())),
  ...authHandlers,
  ...attemptsHandlers,
];
