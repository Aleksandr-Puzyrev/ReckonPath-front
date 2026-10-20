import { MutationObserver, QueryClient } from "@tanstack/react-query";

import { mockServer } from "@shared/test-utils/api-mock";

import { createTicketMutationOptions } from "./create-ticket-mutation";

const queryClient = new QueryClient({ defaultOptions: { mutations: { gcTime: Infinity } } });

const send = (message: string) =>
  new MutationObserver(queryClient, createTicketMutationOptions()).mutate({
    topic: "ban_appeal",
    message,
    diagnostics: { appVersion: "1.0.0", device: "ios", userId: "u1" },
  });

describe("createTicketMutationOptions", () => {
  afterEach(() => mockServer.reset());

  test("creates a support ticket (Part 7 §6)", async () => {
    expect(await send("Not me")).toEqual({ ticketId: "ticket_1" });
  });

  test("refuses an empty message", async () => {
    await expect(send("")).rejects.toMatchObject({ code: "VALIDATION" });
  });
});
