import { act, renderHook, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";

import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";
import { MOCK_REJECTED_PASSWORD } from "@shared/api/mocks/auth-handlers";

import { useSignUp } from "./use-sign-up";

const SIGN_UP = {
  nickname: "Seeker_7",
  email: "seeker@reckon.app",
  password: "Signal2026",
  isConsentGiven: true,
  isMarketingAllowed: false,
};

const callbacks = () => ({ onCodeSent: jest.fn(), onFieldError: jest.fn(), onError: jest.fn() });

const renderSignUp = (handlers: ReturnType<typeof callbacks>) =>
  renderHook(() => useSignUp(handlers), { wrapper: createQueryWrapper() });

const watchRegister = () => {
  const bodies: unknown[] = [];
  mockServer.use(
    http.post(mockUrl("/auth/register"), async ({ request }) => {
      bodies.push(await request.clone().json());
      return undefined;
    }),
  );
  return bodies;
};

afterEach(() => mockServer.reset());

describe("useSignUp", () => {
  test("sends the consents and opens the code step (decision 0050 #2, #5)", async () => {
    const handlers = callbacks();
    const bodies = watchRegister();
    const { result } = await renderSignUp(handlers);

    await act(async () => result.current.submit({ ...SIGN_UP, isMarketingAllowed: true }));

    await waitFor(() => expect(handlers.onCodeSent).toHaveBeenCalledWith(SIGN_UP.email, 60));
    expect(bodies[0]).toEqual(
      expect.objectContaining({
        acceptTerms: true,
        acceptPrivacy: true,
        acceptMarketing: true,
      }),
    );
  });

  test("puts a password the server rejects under the password field (decision 0050 #6)", async () => {
    const handlers = callbacks();
    const { result } = await renderSignUp(handlers);

    await act(async () => result.current.submit({ ...SIGN_UP, password: MOCK_REJECTED_PASSWORD }));

    await waitFor(() =>
      expect(handlers.onFieldError).toHaveBeenCalledWith(
        "password",
        "account.errors.passwordRejected",
      ),
    );
  });

  test("shows other failures as a toast", async () => {
    const handlers = callbacks();
    mockServer.use(
      http.post(mockUrl("/auth/register"), () =>
        HttpResponse.json({ error: { code: "too_many_requests" } }, { status: 429 }),
      ),
    );
    const { result } = await renderSignUp(handlers);

    await act(async () => result.current.submit(SIGN_UP));

    await waitFor(() => expect(handlers.onError).toHaveBeenCalledWith("errors.too_many_requests"));
  });
});
