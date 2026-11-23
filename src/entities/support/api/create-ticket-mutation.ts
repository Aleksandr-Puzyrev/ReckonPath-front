import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";
import type { components } from "@shared/api";

export type SupportTicket = components["schemas"]["SupportTicket"];
export type SupportTopic = SupportTicket["topic"];

interface TicketRequest {
  ticket: SupportTicket;
  idempotencyKey: string;
}

export const createTicketMutationOptions = () =>
  mutationOptions({
    mutationKey: ["support", "ticket"],
    // Offline the request fails at once instead of waiting in a queue (без сети запрос сразу падает, а не ждёт в очереди).
    networkMode: "always",
    mutationFn: async ({ ticket, idempotencyKey }: TicketRequest) =>
      readData(
        await apiClient.POST("/support/tickets", {
          body: ticket,
          headers: { "Idempotency-Key": idempotencyKey },
        }),
      ),
  });
