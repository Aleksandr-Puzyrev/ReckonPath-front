import { fireEvent, render, screen } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";

import { useSystemNoticeStore } from "@entities/app-config";
import { i18n } from "@shared/i18n";
import { maintenanceMock, mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import MaintenanceScreen from "./maintenance-screen";

const until = new Date(2026, 8, 26, 15, 30).toISOString();

const serveMaintenance = (message = "") =>
  mockServer.use(
    http.get(mockUrl("/maintenance"), () =>
      HttpResponse.json(maintenanceMock({ active: false, message })),
    ),
  );

// A 503 from any request can carry the end time (503 на любой запрос может принести время окончания).
const serveMaintenanceError = (details: { until?: string; message?: string }) =>
  mockServer.use(
    http.get(mockUrl("/version"), () =>
      HttpResponse.json({ error: { code: "maintenance", details } }, { status: 503 }),
    ),
  );

const renderScreen = () => render(<MaintenanceScreen />, { wrapper: createQueryWrapper() });

describe("MaintenanceScreen", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("ru");
    useSystemNoticeStore.getState().reset();
  });

  afterEach(() => mockServer.reset());

  test("shows the server message and the end time (NET-04)", async () => {
    serveMaintenanceError({ until, message: "Обновляем сервер арены." });

    await renderScreen();

    expect(
      await screen.findByText("Обновляем сервер арены. Завершим примерно в 15:30"),
    ).toBeOnTheScreen();
  });

  test("shows the backend's maintenance message (decision 0049 #4)", async () => {
    serveMaintenance("Обновляем сервер арены.");

    await renderScreen();

    expect(await screen.findByText("Обновляем сервер арены.")).toBeOnTheScreen();
  });

  test("lets the player go offline", async () => {
    serveMaintenanceError({ until });
    await renderScreen();

    await fireEvent.press(await screen.findByRole("button", { name: "Играть офлайн" }));

    expect(useSystemNoticeStore.getState().isMaintenanceDismissed).toBe(true);
  });

  test("checks again and says when the works are still going on", async () => {
    serveMaintenanceError({ until });
    await renderScreen();
    await screen.findByText("Завершим примерно в 15:30");

    await fireEvent.press(screen.getByRole("button", { name: "Проверить снова" }));

    expect(await screen.findByText("Всё ещё идут работы")).toBeOnTheScreen();
  });

  test("tells about a missing connection when the check fails", async () => {
    serveMaintenance("Обновляем сервер арены.");
    await renderScreen();
    await screen.findByText("Обновляем сервер арены.");
    mockServer.use(http.get(mockUrl("/maintenance"), () => HttpResponse.error()));

    await fireEvent.press(screen.getByRole("button", { name: "Проверить снова" }));

    expect(await screen.findByText("Нет связи с сервером")).toBeOnTheScreen();
  });
});
