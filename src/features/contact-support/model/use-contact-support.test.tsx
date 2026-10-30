import { act, renderHook, waitFor } from "@testing-library/react-native";
import { http } from "msw/http";

import { useAccountStore } from "@entities/session";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import { useContactSupport } from "./use-contact-support";

const watchTickets = () => {
  const bodies: unknown[] = [];
  mockServer.use(
    http.post(mockUrl("/support/tickets"), async ({ request }) => {
      bodies.push(await request.clone().json());
      return undefined;
    }),
  );
  return bodies;
};

const send = async () => {
  const onSent = jest.fn();
  const { result } = await renderHook(
    () => useContactSupport("support", { onSent, onError: jest.fn() }),
    { wrapper: createQueryWrapper() },
  );
  // The player's data arrives long before a message is typed (данные игрока приходят задолго до того, как набрано сообщение).
  await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
  await act(async () => result.current.submit("Не приходит код"));
  await waitFor(() => expect(onSent).toHaveBeenCalled());
};

describe("useContactSupport", () => {
  afterEach(() => {
    mockServer.reset();
    useAccountStore.getState().reset();
  });

  test("sends a guest's message without a player id (decision 0051 #10)", async () => {
    const bodies = watchTickets();

    await send();

    expect(bodies[0]).toEqual(
      expect.objectContaining({
        diagnostics: expect.not.objectContaining({ userId: expect.anything() }),
      }),
    );
  });

  test("adds the player id for an account", async () => {
    useAccountStore.getState().markSignedIn();
    const bodies = watchTickets();

    await send();

    expect(bodies[0]).toEqual(
      expect.objectContaining({
        diagnostics: expect.objectContaining({ userId: expect.any(String) }),
      }),
    );
  });
});
