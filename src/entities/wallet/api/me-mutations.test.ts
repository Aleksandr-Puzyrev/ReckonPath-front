import { MutationObserver, QueryClient } from "@tanstack/react-query";

import { apiClient } from "@shared/api";
import { mockServer } from "@shared/test-utils/api-mock";

import { deleteMeMutationOptions, restoreMeMutationOptions } from "./me-mutations";

const queryClient = new QueryClient({ defaultOptions: { mutations: { gcTime: Infinity } } });

const deletionAt = async () => (await apiClient.GET("/me")).data?.flags.deletionScheduledAt;

const remove = (password: string) =>
  new MutationObserver(queryClient, deleteMeMutationOptions()).mutate(password);

describe("me mutations", () => {
  afterEach(() => mockServer.reset());

  test("schedules the deletion in 30 days by the password (Part 1 §7.6, decision 0052 #2)", async () => {
    const before = Date.now();

    const { purgeAfter } = await remove("Signal2026");

    const days = (new Date(purgeAfter).getTime() - before) / 86_400_000;
    expect(Math.round(days)).toBe(30);
  });

  test("refuses a wrong password", async () => {
    await expect(remove("000000")).rejects.toMatchObject({ code: "wrong_password" });
  });

  test("cancels a scheduled deletion", async () => {
    await remove("Signal2026");

    await new MutationObserver(queryClient, restoreMeMutationOptions()).mutate();

    expect(await deletionAt()).toBeNull();
  });
});
