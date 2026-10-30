import { ApiError } from "@shared/api";
import { maintenanceMock, versionMock } from "@shared/test-utils/api-mock";

import { systemStateOf } from "./system-state";

const LINKS = {
  ruStore: "https://www.rustore.ru/catalog/app/reckon",
  playMarket: "https://play.google.com/store/apps/details?id=reckon",
  appStore: "",
};

const stateOf = (overrides: Partial<Parameters<typeof systemStateOf>[0]> = {}) =>
  systemStateOf({
    version: versionMock(LINKS),
    maintenance: maintenanceMock(),
    error: null,
    store: "playMarket",
    ...overrides,
  });

describe("systemStateOf", () => {
  test("is ready when the backend asks for nothing", () => {
    expect(stateOf()).toEqual({ kind: "ready" });
  });

  test("forces the update by the backend flag with the link of the install store", () => {
    expect(
      stateOf({ version: versionMock({ ...LINKS, forceUpdate: true }), store: "ruStore" }),
    ).toEqual({ kind: "forcedUpdate", storeUrl: LINKS.ruStore });
  });

  test("forces the update on a 426 from any request with the link from its data", () => {
    const error = new ApiError(426, "app_update_required", { playMarket: LINKS.playMarket });

    expect(stateOf({ error })).toEqual({
      kind: "forcedUpdate",
      storeUrl: LINKS.playMarket,
    });
  });

  test("puts the forced update before maintenance", () => {
    const state = stateOf({
      version: versionMock({ forceUpdate: true }),
      maintenance: maintenanceMock({ active: false }),
    });

    expect(state.kind).toBe("forcedUpdate");
  });

  test("shows maintenance with the backend's message when the app does not work", () => {
    expect(
      stateOf({ maintenance: maintenanceMock({ active: false, message: "До 18:00" }) }),
    ).toEqual({ kind: "maintenance", until: null, message: "До 18:00" });
  });

  test("falls back to the client text for an empty maintenance message", () => {
    expect(stateOf({ maintenance: maintenanceMock({ active: false }) })).toEqual({
      kind: "maintenance",
      until: null,
      message: null,
    });
  });

  test("shows maintenance on a 503 from any request", () => {
    const error = new ApiError(503, "maintenance", { message: "Скоро вернёмся" });

    expect(stateOf({ error })).toEqual({
      kind: "maintenance",
      until: null,
      message: "Скоро вернёмся",
    });
  });

  test("offers the soft update with the current version", () => {
    const version = versionMock({ ...LINKS, showModal: true, currentVersion: "1.5.0" });

    expect(stateOf({ version })).toEqual({
      kind: "softUpdate",
      version: "1.5.0",
      storeUrl: LINKS.playMarket,
    });
  });

  test("gives no link when the backend has none for the install store", () => {
    const version = versionMock({ ...LINKS, showModal: true });

    expect(stateOf({ version, store: "appStore" })).toEqual(
      expect.objectContaining({ kind: "softUpdate", storeUrl: null }),
    );
  });
});
