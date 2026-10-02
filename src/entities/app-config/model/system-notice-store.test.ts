import { isSoftUpdateSnoozed, useSystemNoticeStore } from "./system-notice-store";

const DAY_MS = 24 * 60 * 60_000;

afterEach(() => {
  useSystemNoticeStore.getState().reset();
  jest.useRealTimers();
});

describe("useSystemNoticeStore", () => {
  test("remembers that maintenance was dismissed", () => {
    useSystemNoticeStore.getState().dismissMaintenance();

    expect(useSystemNoticeStore.getState().isMaintenanceDismissed).toBe(true);
  });

  test("remembers when the soft update was dismissed", () => {
    jest.useFakeTimers({ now: 1_000 });

    useSystemNoticeStore.getState().dismissSoftUpdate();

    expect(useSystemNoticeStore.getState().softUpdateDismissedAt).toBe(1_000);
  });

  test("persists only the soft update time", async () => {
    useSystemNoticeStore.getState().dismissMaintenance();
    useSystemNoticeStore.getState().dismissSoftUpdate();

    const persisted = useSystemNoticeStore.persist
      .getOptions()
      .partialize?.(useSystemNoticeStore.getState());

    expect(persisted).toEqual({
      softUpdateDismissedAt: useSystemNoticeStore.getState().softUpdateDismissedAt,
    });
  });

  test("migrates a broken persisted value to the defaults", async () => {
    const migrate = useSystemNoticeStore.persist.getOptions().migrate;

    expect(await migrate?.({ softUpdateDismissedAt: "soon" }, 0)).toEqual({
      softUpdateDismissedAt: null,
    });
  });

  test("reset brings the notices back", () => {
    useSystemNoticeStore.getState().dismissMaintenance();
    useSystemNoticeStore.getState().dismissSoftUpdate();

    useSystemNoticeStore.getState().reset();

    expect(useSystemNoticeStore.getState()).toMatchObject({
      isMaintenanceDismissed: false,
      softUpdateDismissedAt: null,
    });
  });
});

describe("isSoftUpdateSnoozed", () => {
  test("hides the soft update for a day after «Позже» (NET-02)", () => {
    expect(isSoftUpdateSnoozed(0, DAY_MS - 1)).toBe(true);
    expect(isSoftUpdateSnoozed(0, DAY_MS)).toBe(false);
  });

  test("shows the soft update that was never dismissed", () => {
    expect(isSoftUpdateSnoozed(null, 0)).toBe(false);
  });
});
