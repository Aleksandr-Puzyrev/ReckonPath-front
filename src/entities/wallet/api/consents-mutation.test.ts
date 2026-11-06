import { MutationObserver, QueryClient } from "@tanstack/react-query";

import { mockServer, requireMockConsent } from "@shared/test-utils/api-mock";

import { applyConsents, updateConsentsMutationOptions } from "./consents-mutation";
import { meQueryOptions } from "./wallet-queries";

const queryClient = new QueryClient();

const update = (type: "terms" | "privacy" | "marketing", accepted: boolean) =>
  new MutationObserver(queryClient, updateConsentsMutationOptions()).mutate({
    consents: [{ type, accepted }],
  });

describe("consents mutation", () => {
  afterEach(() => {
    queryClient.clear();
    mockServer.reset();
  });

  test("accepting a new document version clears the required consents (decision 0056 #3)", async () => {
    requireMockConsent("privacy");

    const state = await update("privacy", true);

    expect(state.consentsRequired).toEqual([]);
  });

  test("switches marketing on (decision 0056 #6)", async () => {
    const state = await update("marketing", true);

    expect(state.consents).toContainEqual(
      expect.objectContaining({ type: "marketing", accepted: true }),
    );
  });

  test("puts only the consent fields into the cached player", async () => {
    const me = await queryClient.fetchQuery(meQueryOptions());

    applyConsents(queryClient, {
      consents: [],
      consentsRequired: ["terms"],
      ...{ email: "backend-only@example.com" },
    });

    expect(queryClient.getQueryData(meQueryOptions().queryKey)).toEqual({
      ...me,
      consents: [],
      consentsRequired: ["terms"],
    });
  });
});
