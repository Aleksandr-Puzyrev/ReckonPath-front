import { act, renderHook, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";

import type { SupportTopic } from "@entities/support";
import { APP_VERSION } from "@shared/config";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import { useContactSupport } from "./use-contact-support";

jest.mock("@shared/config", () => ({
  ...jest.requireActual<object>("@shared/config"),
  APP_VERSION: "1.4.2-".padEnd(50, "x"),
}));
jest.mock("expo-device", () => ({ osVersion: "18.1", modelName: "iPhone ".padEnd(200, "y") }));

const watchTickets = () => {
  const requests: Request[] = [];
  mockServer.use(
    http.post(mockUrl("/support/tickets"), ({ request }) => {
      requests.push(request.clone());
      return undefined;
    }),
  );
  return requests;
};

const renderSupport = async (topic: SupportTopic) => {
  const callbacks = { onSent: jest.fn(), onError: jest.fn() };
  const { result } = await renderHook(() => useContactSupport(topic, callbacks), {
    wrapper: createQueryWrapper(),
  });
  // The player's data arrives long before a message is typed (данные игрока приходят задолго до того, как набрано сообщение).
  await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
  return { result, callbacks };
};

const submit = async (topic: SupportTopic) => {
  const support = await renderSupport(topic);
  await act(async () => support.result.current.submit("Не приходит код"));
  return support.callbacks;
};

describe("useContactSupport", () => {
  afterEach(() => mockServer.reset());

  test("sends the topic, the player id and diagnostics cut to the backend limits (decision 0064 #1, #5)", async () => {
    const requests = watchTickets();

    const { onSent } = await submit("support");

    await waitFor(() => expect(onSent).toHaveBeenCalled());
    const body: unknown = await requests[0]?.json();
    expect(body).toEqual({
      topic: "support",
      message: "Не приходит код",
      diagnostics: {
        appVersion: APP_VERSION.slice(0, 40),
        device: expect.stringMatching(/^\S+ 18\.1 iPhone y+$/),
        userId: expect.any(String),
      },
    });
    expect(body).toHaveProperty("diagnostics.device.length", 120);
  });

  test("gives each send its own idempotency key (decision 0064 #6)", async () => {
    const requests = watchTickets();
    const { result, callbacks } = await renderSupport("support");

    await act(async () => result.current.submit("Первое"));
    await waitFor(() => expect(callbacks.onSent).toHaveBeenCalledTimes(1));
    await act(async () => result.current.submit("Второе"));
    await waitFor(() => expect(callbacks.onSent).toHaveBeenCalledTimes(2));

    const keys = requests.map((request) => request.headers.get("Idempotency-Key"));
    expect(keys[0]).toEqual(expect.any(String));
    expect(keys[0]).not.toBe(keys[1]);
  });

  test("reports a support message as sent (decision 0064 #3)", async () => {
    const { onSent } = await submit("support");

    await waitFor(() => expect(onSent).toHaveBeenCalledWith("settings.supportSent"));
  });

  test("reports an appeal as sent with the appeal text (decision 0038 #5)", async () => {
    const { onSent } = await submit("ban_appeal");

    await waitFor(() => expect(onSent).toHaveBeenCalledWith("system.appeal.sent"));
  });

  test("tells about the daily limit after five tickets (decision 0064 #2)", async () => {
    const { result, callbacks } = await renderSupport("support");
    for (const count of [1, 2, 3, 4, 5]) {
      await act(async () => result.current.submit("Вопрос"));
      await waitFor(() => expect(callbacks.onSent).toHaveBeenCalledTimes(count));
    }

    await act(async () => result.current.submit("Вопрос"));

    await waitFor(() => expect(callbacks.onError).toHaveBeenCalledWith("errors.tickets_limit"));
  });

  test("shows the generic text when the server refuses the ticket", async () => {
    mockServer.use(
      http.post(mockUrl("/support/tickets"), () =>
        HttpResponse.json({ error: { code: "validation_failed" } }, { status: 422 }),
      ),
    );

    const { onError } = await submit("support");

    await waitFor(() => expect(onError).toHaveBeenCalledWith("errors.generic"));
  });

  test("tells about the unavailable service (decision 0064 #8)", async () => {
    mockServer.use(
      http.post(mockUrl("/support/tickets"), () =>
        HttpResponse.json({ error: { code: "rate_limit_unavailable" } }, { status: 503 }),
      ),
    );

    const { onError } = await submit("support");

    await waitFor(() => expect(onError).toHaveBeenCalledWith("errors.rate_limit_unavailable"));
  });
});
