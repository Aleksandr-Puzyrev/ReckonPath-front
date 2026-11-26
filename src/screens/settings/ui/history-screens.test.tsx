import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";

import { i18n } from "@shared/i18n";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import NotificationHistoryScreen from "./notification-history-screen";
import SupportHistoryScreen from "./support-history-screen";

jest.mock("expo-router", () => ({ router: { canGoBack: () => false } }));
jest.mock("@shared/config", () => ({
  ...jest.requireActual("@shared/config"),
  API_BASE_URL: "",
  HAS_BACKEND: true,
}));

describe("account histories", () => {
  beforeAll(() => i18n.changeLanguage("en"));
  afterEach(() => mockServer.reset());

  test("refreshes the notification once marking it as read succeeds", async () => {
    const date = "2026-11-25T12:00:00Z";
    let readAt: string | null = null;
    mockServer.use(
      http.get(mockUrl("/me/notifications"), () =>
        HttpResponse.json({
          items: [
            {
              id: "note",
              title: "A new event",
              body: "The event starts today.",
              readAt,
              createdAt: date,
            },
          ],
        }),
      ),
      http.put(mockUrl("/me/notifications/note/read"), () => {
        readAt = date;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await render(<NotificationHistoryScreen />, { wrapper: createQueryWrapper() });
    await fireEvent.press(await screen.findByRole("button", { name: "Mark as read: A new event" }));

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Mark as read: A new event" })).toBeNull(),
    );
    expect(screen.getByText("A new event")).toBeOnTheScreen();
  });

  test("shows the support reply with its request", async () => {
    mockServer.use(
      http.get(mockUrl("/support/tickets"), () =>
        HttpResponse.json({
          tickets: [
            {
              id: "ticket",
              topic: "support",
              status: "answered",
              message: "My question",
              answer: "The reply",
              createdAt: "2026-11-25T12:00:00Z",
            },
          ],
        }),
      ),
    );

    await render(<SupportHistoryScreen />, { wrapper: createQueryWrapper() });

    expect(await screen.findByText("The reply")).toBeOnTheScreen();
    expect(screen.getByText("My question")).toBeOnTheScreen();
  });
});
