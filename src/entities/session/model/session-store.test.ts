import { useSessionStore } from "./session-store";

afterEach(() => useSessionStore.getState().reset());

describe("useSessionStore", () => {
  test("keeps the access token in memory", () => {
    useSessionStore.getState().setAccessToken("a_1");

    expect(useSessionStore.getState().accessToken).toBe("a_1");
  });

  test("reset forgets the access token", () => {
    useSessionStore.getState().setAccessToken("a_1");

    useSessionStore.getState().reset();

    expect(useSessionStore.getState().accessToken).toBeNull();
  });

  test("treats a token as expired shortly before its expiry", () => {
    useSessionStore.getState().setAccessToken("a_1", 100_000);

    expect(useSessionStore.getState().isExpired(60_000)).toBe(false);
    expect(useSessionStore.getState().isExpired(80_000)).toBe(true);
  });

  test("does not call a token without a known expiry expired", () => {
    useSessionStore.getState().setAccessToken("a_1");

    expect(useSessionStore.getState().isExpired(Number.MAX_SAFE_INTEGER)).toBe(false);
  });
});
