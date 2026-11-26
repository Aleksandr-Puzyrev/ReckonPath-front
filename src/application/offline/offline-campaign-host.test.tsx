import { onlineManager } from "@tanstack/react-query";
import { act, cleanup, render, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";

import { useOfflineCampaign } from "@entities/offline-campaign";
import { useAccountStore } from "@entities/session";
import { apiClient, readData } from "@shared/api";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import OfflineCampaignHost from "./offline-campaign-host";

jest.mock("@shared/config", () => ({
  ...jest.requireActual("@shared/config"),
  API_BASE_URL: "",
  HAS_BACKEND: true,
}));

afterEach(async () => {
  await cleanup();
  await act(() => onlineManager.setOnline(true));
  useOfflineCampaign.getState().reset();
  useAccountStore.getState().reset();
  mockServer.reset();
});

test("sends completed attempts when the connection comes back and acknowledges the server result", async () => {
  await act(() => onlineManager.setOnline(false));
  useAccountStore.getState().markSignedIn();
  const store = useOfflineCampaign.getState();
  store.bind(readData(await apiClient.GET("/me")).id);
  const result = {
    id: "test-attempt",
    packId: "test-pack",
    level: 2,
    version: 1,
    startedAt: "2026-11-26T00:00:00.000Z",
    finishedAt: "2026-11-26T00:00:10.000Z",
    taps: [[0, 1] as [number, number]],
  };
  store.finish({ ...result, won: true });
  const capture = jest.fn();
  mockServer.use(
    http.post(mockUrl("/campaign/offline/sync"), async ({ request }) => {
      capture(await request.json(), request.headers.get("Idempotency-Key"));
      return HttpResponse.json({
        results: [{ id: result.id, status: "won", stars: 3, reward: 10 }],
        wallet: { coins: 60, gems: 0 },
      });
    }),
    http.post(mockUrl("/campaign/offline/pack"), () =>
      HttpResponse.json({ alg: "A256GCM", levels: [] }),
    ),
  );

  await render(<OfflineCampaignHost canSync />, { wrapper: createQueryWrapper() });
  expect(capture).not.toHaveBeenCalled();

  await act(() => onlineManager.setOnline(true));

  await waitFor(() =>
    expect(capture).toHaveBeenCalledWith({ results: [result] }, expect.any(String)),
  );
  await waitFor(() => expect(useOfflineCampaign.getState().pending).toEqual([]));
});
