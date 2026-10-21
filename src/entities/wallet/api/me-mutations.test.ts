import { MutationObserver, QueryClient } from "@tanstack/react-query";

import { apiClient } from "@shared/api";
import { mockServer } from "@shared/test-utils/api-mock";

import {
  deleteMeMutationOptions,
  restoreMeMutationOptions,
  updateLocaleMutationOptions,
} from "./me-mutations";

const queryClient = new QueryClient({ defaultOptions: { mutations: { gcTime: Infinity } } });

const deletionAt = async () => (await apiClient.GET("/me")).data?.flags.deletionScheduledAt;

describe("me mutations", () => {
  afterEach(() => mockServer.reset());

  test("saves the chosen language on the server (NET-12)", async () => {
    const me = await new MutationObserver(queryClient, updateLocaleMutationOptions()).mutate("en");

    expect(me.id).toBeDefined();
  });

  test("schedules the deletion in 30 days with the right nickname (Part 1 §7.6)", async () => {
    const before = Date.now();
    const { deletionScheduledAt } = await new MutationObserver(
      queryClient,
      deleteMeMutationOptions(),
    ).mutate("Player4821");

    const days = (new Date(deletionScheduledAt).getTime() - before) / 86_400_000;
    expect(Math.round(days)).toBe(30);
    expect(await deletionAt()).toBe(deletionScheduledAt);
  });

  test("refuses another nickname", async () => {
    await expect(
      new MutationObserver(queryClient, deleteMeMutationOptions()).mutate("Somebody"),
    ).rejects.toMatchObject({ code: "VALIDATION" });
  });

  test("cancels a scheduled deletion", async () => {
    await new MutationObserver(queryClient, deleteMeMutationOptions()).mutate("Player4821");

    await new MutationObserver(queryClient, restoreMeMutationOptions()).mutate();

    expect(await deletionAt()).toBeNull();
  });
});
