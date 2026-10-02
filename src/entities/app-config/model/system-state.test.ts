import { ApiError } from "@shared/api";
import { bootstrapMock } from "@shared/test-utils/api-mock";

import { systemStateOf } from "./system-state";

const APP_VERSION = "1.2.0";
const STORE_URL = "https://apps.apple.com/app/id000";

const bootstrapWith = (overrides: Partial<ReturnType<typeof bootstrapMock>>) => ({
  ...bootstrapMock(),
  ...overrides,
});

const versions = (min: string, recommended: string) => ({
  version: { min, recommended, storeUrl: STORE_URL, message: "New skins" },
});

describe("systemStateOf", () => {
  test("requires an update when the app is below the minimum version", () => {
    expect(systemStateOf(bootstrapWith(versions("1.3.0", "1.3.0")), null, APP_VERSION)).toEqual({
      kind: "forcedUpdate",
      storeUrl: STORE_URL,
      message: "New skins",
    });
  });

  test("requires an update when a request answered 426", () => {
    const state = systemStateOf(undefined, new ApiError(426, "UPGRADE_REQUIRED"), APP_VERSION);

    expect(state).toEqual({ kind: "forcedUpdate", storeUrl: null, message: null });
  });

  test("offers an update when the app is below the recommended version", () => {
    expect(systemStateOf(bootstrapWith(versions("1.1.0", "1.3.0")), null, APP_VERSION)).toEqual({
      kind: "softUpdate",
      version: "1.3.0",
      storeUrl: STORE_URL,
      message: "New skins",
    });
  });

  test("shows maintenance from the bootstrap", () => {
    const bootstrap = bootstrapWith({
      ...versions("1.0.0", "1.2.0"),
      maintenance: { until: "2026-09-26T12:30:00Z", message: "Arena servers" },
    });

    expect(systemStateOf(bootstrap, null, APP_VERSION)).toEqual({
      kind: "maintenance",
      until: "2026-09-26T12:30:00Z",
      message: "Arena servers",
    });
  });

  test("shows maintenance from a 503 with its details", () => {
    const error = new ApiError(503, "MAINTENANCE", { until: "2026-09-26T12:30:00Z" });

    expect(systemStateOf(undefined, error, APP_VERSION)).toEqual({
      kind: "maintenance",
      until: "2026-09-26T12:30:00Z",
      message: null,
    });
  });

  test("puts the forced update before maintenance", () => {
    const bootstrap = bootstrapWith({
      ...versions("1.3.0", "1.3.0"),
      maintenance: { message: "Arena servers" },
    });

    expect(systemStateOf(bootstrap, null, APP_VERSION).kind).toBe("forcedUpdate");
  });

  test("lets the app start when the bootstrap failed without a cache", () => {
    expect(systemStateOf(undefined, new TypeError("Network request failed"), APP_VERSION)).toEqual({
      kind: "ready",
    });
  });

  test("is ready on the current version without maintenance", () => {
    expect(systemStateOf(bootstrapWith(versions("1.0.0", "1.2.0")), null, APP_VERSION)).toEqual({
      kind: "ready",
    });
  });
});
