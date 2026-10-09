import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

export const createQueryWrapper = () => {
  const queryClient = new QueryClient({
    // Infinite gcTime starts no timer, so Jest exits right after the run (бесконечный gcTime не заводит таймер, и Jest завершается сразу после прогона).
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { gcTime: Infinity },
    },
  });
  const QueryWrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return QueryWrapper;
};
