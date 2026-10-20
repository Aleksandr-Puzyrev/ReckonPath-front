import { MutationObserver, QueryClient } from "@tanstack/react-query";

import { apiClient } from "@shared/api";
import { mockServer } from "@shared/test-utils/api-mock";

import { completeOnboardingMutationOptions } from "./complete-onboarding-mutation";

const queryClient = new QueryClient({
  defaultOptions: { mutations: { gcTime: Infinity } },
});

describe("completeOnboardingMutationOptions", () => {
  afterEach(() => mockServer.reset());

  test("marks the arena onboarding done on the server (decision 0037 #1)", async () => {
    expect((await apiClient.GET("/arena")).data?.onboardingDone).toBe(false);

    const result = await new MutationObserver(
      queryClient,
      completeOnboardingMutationOptions(),
    ).mutate();

    expect(result).toEqual({ onboardingDone: true });
    expect((await apiClient.GET("/arena")).data?.onboardingDone).toBe(true);
  });
});
