import { http, HttpResponse } from "msw/http";

import { APP_VERSION } from "@shared/config";

import type { components } from "../generated/schema";

import { adsHandlers } from "./ads-handlers";
import { arenaHandlers } from "./arena-handlers";
import { asyncHandlers } from "./async-handlers";
import { arenaMapHandlers } from "./arena-map-handlers";
import { attemptsHandlers } from "./attempts-handlers";
import { authHandlers } from "./auth-handlers";
import { customLevelHandlers } from "./custom-level-handlers";
import { dailyHandlers } from "./daily-handlers";
import { meHandlers } from "./me-handlers";
import { mockUrl } from "./mock-url";
import { shopHandlers } from "./shop-handlers";
import { supportHandlers } from "./support-handlers";
import { walletHandlers } from "./wallet-handlers";

type Bootstrap = components["schemas"]["Bootstrap"];
type VersionInfo = components["schemas"]["VersionInfo"];
type MaintenanceStatus = components["schemas"]["MaintenanceStatus"];

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

export const versionMock = (overrides: Partial<VersionInfo> = {}): VersionInfo => ({
  showModal: false,
  forceUpdate: false,
  minVersion: APP_VERSION,
  currentVersion: APP_VERSION,
  ruStore: "",
  playMarket: "",
  appStore: "",
  ...overrides,
});

export const maintenanceMock = (overrides: Partial<MaintenanceStatus> = {}): MaintenanceStatus => ({
  active: true,
  message: "",
  ...overrides,
});

export const handlers = [
  http.get(mockUrl("/bootstrap"), () => HttpResponse.json(bootstrapMock())),
  http.get(mockUrl("/version"), () => HttpResponse.json(versionMock())),
  http.get(mockUrl("/maintenance"), () => HttpResponse.json(maintenanceMock())),
  ...authHandlers,
  ...attemptsHandlers,
  ...dailyHandlers,
  ...meHandlers,
  ...walletHandlers,
  ...shopHandlers,
  ...adsHandlers,
  ...arenaHandlers,
  ...arenaMapHandlers,
  ...asyncHandlers,
  ...supportHandlers,
  ...customLevelHandlers,
];
