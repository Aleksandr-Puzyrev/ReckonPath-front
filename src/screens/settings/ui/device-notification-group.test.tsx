import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";

import { i18n } from "@shared/i18n";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import DeviceNotificationGroup from "./device-notification-group";

jest.mock("@shared/config", () => ({
  ...jest.requireActual("@shared/config"),
  API_BASE_URL: "",
  HAS_BACKEND: true,
}));

const path = mockUrl("/me/devices/current/notifications");

beforeAll(() => i18n.changeLanguage("en"));
afterEach(async () => {
  await cleanup();
  mockServer.reset();
});

test("saves the selected channels and leaves unrelated channels enabled", async () => {
  const capture = jest.fn();
  mockServer.use(
    http.get(path, () =>
      HttpResponse.json({ tz: "UTC", locale: "en", channels: ["daily", "arena"] }),
    ),
    http.put(path, async ({ request }) => {
      const body = await request.text();
      const settings: unknown = JSON.parse(body);
      capture(settings, request.headers.get("Idempotency-Key"));
      return new HttpResponse(body, { headers: { "Content-Type": "application/json" } });
    }),
  );
  await render(<DeviceNotificationGroup />, { wrapper: createQueryWrapper() });
  const daily = await screen.findByTestId("device-notification-daily");
  expect(daily).toHaveProp("value", true);

  await fireEvent(daily, "valueChange", false);

  await waitFor(() => expect(daily).toHaveProp("value", false));
  expect(screen.getByTestId("device-notification-arena")).toHaveProp("value", true);
  expect(capture).toHaveBeenCalledWith(
    { tz: expect.any(String), locale: "en", channels: ["arena"] },
    expect.any(String),
  );
});

test("keeps the last confirmed settings when the update fails", async () => {
  mockServer.use(
    http.get(path, () => HttpResponse.json({ tz: "UTC", locale: "en", channels: ["daily"] })),
    http.put(path, () => HttpResponse.json({ error: { code: "no_device" } }, { status: 409 })),
  );
  await render(<DeviceNotificationGroup />, { wrapper: createQueryWrapper() });
  const daily = await screen.findByTestId("device-notification-daily");

  await fireEvent(daily, "valueChange", false);

  expect(
    await screen.findByText(
      "This session has no device. Sign in again to update notification settings.",
    ),
  ).toBeOnTheScreen();
  expect(daily).toHaveProp("value", true);
});
