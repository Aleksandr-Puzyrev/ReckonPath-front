import { act, renderHook, waitFor } from "@testing-library/react-native";
import { getItemAsync } from "expo-secure-store";
import { http, HttpResponse } from "msw/http";

import { useProgressStore } from "@entities/progress";
import { useAccountStore, useSessionStore } from "@entities/session";
import { MOCK_WRONG_PASSWORD } from "@shared/api/mocks/auth-handlers";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import { useSignIn } from "./use-sign-in";

const secureStore = jest.requireMock<{ __reset: () => void }>("expo-secure-store");

const CREDENTIALS = { email: "nova@mail.ru", password: "Signal2026" };

const callbacks = () => ({
  onSignedIn: jest.fn(),
  onWrongCredentials: jest.fn(),
  onNeedsCode: jest.fn(),
  onError: jest.fn(),
});

const renderSignIn = (handlers: ReturnType<typeof callbacks>) =>
  renderHook(() => useSignIn(handlers), { wrapper: createQueryWrapper() });

afterEach(() => {
  mockServer.reset();
  secureStore.__reset();
  useSessionStore.getState().reset();
  useAccountStore.getState().reset();
  useProgressStore.getState().reset();
});

describe("useSignIn", () => {
  test("opens the account's session and keeps the guest's progress (decision 0050 #4)", async () => {
    useProgressStore.getState().recordWin("c-1", { stars: 3, moves: 4 });
    const handlers = callbacks();
    const { result } = await renderSignIn(handlers);

    await act(async () => result.current.submit(CREDENTIALS));

    await waitFor(() => expect(handlers.onSignedIn).toHaveBeenCalled());
    expect(useAccountStore.getState().hasLogin).toBe(true);
    expect(await getItemAsync("reckon-path.refresh-token")).toBe("r_1");
    expect(useProgressStore.getState().best["c-1"]).toBeDefined();
  });

  test("puts wrong credentials under the password field", async () => {
    const handlers = callbacks();
    const { result } = await renderSignIn(handlers);

    await act(async () => result.current.submit({ ...CREDENTIALS, password: MOCK_WRONG_PASSWORD }));

    await waitFor(() =>
      expect(handlers.onWrongCredentials).toHaveBeenCalledWith("errors.invalid_credentials"),
    );
    expect(useAccountStore.getState().hasLogin).toBe(false);
  });

  test("sends a new code for an unconfirmed e-mail (decision 0050 #2)", async () => {
    const handlers = callbacks();
    mockServer.use(
      http.post(mockUrl("/auth/login"), () =>
        HttpResponse.json({ error: { code: "email_not_verified" } }, { status: 403 }),
      ),
    );
    const { result } = await renderSignIn(handlers);

    await act(async () => result.current.submit(CREDENTIALS));

    await waitFor(() => expect(handlers.onNeedsCode).toHaveBeenCalledWith(CREDENTIALS.email, 60));
  });

  test("shows other failures as a toast", async () => {
    const handlers = callbacks();
    mockServer.use(
      http.post(mockUrl("/auth/login"), () =>
        HttpResponse.json({ error: { code: "too_many_requests" } }, { status: 429 }),
      ),
    );
    const { result } = await renderSignIn(handlers);

    await act(async () => result.current.submit(CREDENTIALS));

    await waitFor(() => expect(handlers.onError).toHaveBeenCalledWith("errors.too_many_requests"));
  });
});
