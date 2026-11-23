import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useMutation } from "@tanstack/react-query";
import { http } from "msw/http";

import { setApiSession } from "@shared/api";
import { ACCOUNT_SESSION } from "@shared/test-utils/account-session";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import { createTicketMutationOptions } from "./create-ticket-mutation";

const TICKET = {
  topic: "support",
  message: "Не приходит код",
  diagnostics: { appVersion: "1.4.2", device: "ios 18.1 iPhone 15" },
} as const;

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

describe("createTicketMutationOptions", () => {
  afterEach(() => {
    setApiSession(null);
    mockServer.reset();
  });

  test("sends the ticket with the token and the action's idempotency key (decision 0064 #1, #6)", async () => {
    setApiSession({ ...ACCOUNT_SESSION, getAccessToken: () => "token-1" });
    const requests = watchTickets();
    const { result } = await renderHook(() => useMutation(createTicketMutationOptions()), {
      wrapper: createQueryWrapper(),
    });

    await act(async () => result.current.mutate({ ticket: TICKET, idempotencyKey: "key-0001" }));

    await waitFor(() => expect(result.current.data?.ticketId).toEqual(expect.any(String)));
    expect(requests[0]?.headers.get("Authorization")).toBe("Bearer token-1");
    expect(requests[0]?.headers.get("Idempotency-Key")).toBe("key-0001");
  });

  test("never leaves the device without an account (decision 0064 #1)", async () => {
    setApiSession({ ...ACCOUNT_SESSION, hasAccount: () => false });
    const requests = watchTickets();
    const { result } = await renderHook(() => useMutation(createTicketMutationOptions()), {
      wrapper: createQueryWrapper(),
    });

    await act(async () => result.current.mutate({ ticket: TICKET, idempotencyKey: "key-0002" }));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(requests).toHaveLength(0);
  });

  test("refuses a blank message like the backend (decision 0064 #1)", async () => {
    const { result } = await renderHook(() => useMutation(createTicketMutationOptions()), {
      wrapper: createQueryWrapper(),
    });

    await act(async () =>
      result.current.mutate({ ticket: { ...TICKET, message: "   " }, idempotencyKey: "key-0003" }),
    );

    await waitFor(() => expect(result.current.error).toMatchObject({ code: "validation_failed" }));
  });
});
