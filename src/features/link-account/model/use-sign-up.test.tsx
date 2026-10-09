import { act, renderHook, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";

import { useAccountStore } from "@entities/session";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import { useSignUp } from "./use-sign-up";

const SIGN_UP = {
  nickname: "Seeker_7",
  email: "seeker@reckon.app",
  password: "Signal2026",
  isConsentGiven: true,
};

const callbacks = () => ({ onLinked: jest.fn(), onFieldError: jest.fn(), onError: jest.fn() });

const renderSignUp = (handlers: ReturnType<typeof callbacks>) =>
  renderHook(() => useSignUp(handlers), { wrapper: createQueryWrapper() });

afterEach(() => {
  mockServer.reset();
  useAccountStore.getState().reset();
});

describe("useSignUp", () => {
  test("turns the guest into an account with a login", async () => {
    const handlers = callbacks();
    const { result } = await renderSignUp(handlers);

    await act(async () => result.current.submit(SIGN_UP));

    await waitFor(() => expect(handlers.onLinked).toHaveBeenCalled());
    expect(useAccountStore.getState()).toMatchObject({ hasLogin: true, linkedNotice: 1 });
  });

  test("puts a taken nickname under the nickname field", async () => {
    const handlers = callbacks();
    const { result } = await renderSignUp(handlers);

    await act(async () => result.current.submit({ ...SIGN_UP, nickname: "Kira" }));

    await waitFor(() =>
      expect(handlers.onFieldError).toHaveBeenCalledWith("nickname", "errors.NICK_TAKEN"),
    );
    expect(useAccountStore.getState().hasLogin).toBe(false);
  });

  test("puts a taken e-mail under the e-mail field", async () => {
    mockServer.use(
      http.post(mockUrl("/auth/register"), () =>
        HttpResponse.json({ error: { code: "EMAIL_TAKEN" } }, { status: 409 }),
      ),
    );
    const handlers = callbacks();
    const { result } = await renderSignUp(handlers);

    await act(async () => result.current.submit(SIGN_UP));

    await waitFor(() =>
      expect(handlers.onFieldError).toHaveBeenCalledWith("email", "errors.EMAIL_TAKEN"),
    );
  });

  test("tells about a lost connection", async () => {
    mockServer.use(http.post(mockUrl("/auth/register"), () => HttpResponse.error()));
    const handlers = callbacks();
    const { result } = await renderSignUp(handlers);

    await act(async () => result.current.submit(SIGN_UP));

    await waitFor(() => expect(handlers.onError).toHaveBeenCalledWith("errors.NETWORK"));
    expect(handlers.onLinked).not.toHaveBeenCalled();
  });
});
