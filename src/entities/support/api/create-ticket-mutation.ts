import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";
import type { components } from "@shared/api";

export type SupportTicket = components["schemas"]["SupportTicket"];

export const createTicketMutationOptions = () =>
  mutationOptions({
    mutationKey: ["support", "ticket"],
    mutationFn: async (body: SupportTicket) =>
      readData(await apiClient.POST("/support/tickets", { body })),
  });
