import { cleanup, render, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";

import { i18n } from "@shared/i18n";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import DeviceNotificationHost from "./device-notification-host";

jest.mock("@shared/config", () => ({
  ...jest.requireActual("@shared/config"),
  API_BASE_URL: "",
  HAS_BACKEND: true,
}));

afterEach(async () => {
  await cleanup();
  mockServer.reset();
});

test("updates device language and time zone without changing channels", async () => {
  await i18n.changeLanguage("en");
  const path = mockUrl("/me/devices/current/notifications");
  const capture = jest.fn();
  mockServer.use(
    http.get(path, () => HttpResponse.json({ tz: "", locale: "ru", channels: ["friends"] })),
    http.put(path, async ({ request }) => {
      const body = await request.text();
      const settings: unknown = JSON.parse(body);
      capture(settings);
      return new HttpResponse(body, { headers: { "Content-Type": "application/json" } });
    }),
  );

  await render(<DeviceNotificationHost />, { wrapper: createQueryWrapper() });

  await waitFor(() =>
    expect(capture).toHaveBeenCalledWith({
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      locale: "en",
      channels: ["friends"],
    }),
  );
});
