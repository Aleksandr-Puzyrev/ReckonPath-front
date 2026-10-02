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
});
