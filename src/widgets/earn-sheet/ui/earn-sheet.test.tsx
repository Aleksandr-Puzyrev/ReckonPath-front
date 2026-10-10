import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import { i18n } from "@shared/i18n";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import EarnSheet from "./earn-sheet";

jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));

const callbacks = () => ({ onDaily: jest.fn(), onMessage: jest.fn(), onClose: jest.fn() });

const renderSheet = async (shortBy: number | null, handlers: ReturnType<typeof callbacks>) => {
  await render(<EarnSheet isOpen shortBy={shortBy} {...handlers} />, {
    wrapper: createQueryWrapper(),
  });
  await screen.findByLabelText("Изумруды: 2640");
};

describe("EarnSheet", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  afterEach(() => mockServer.reset());

  test("tells how many emeralds are short", async () => {
    await renderSheet(20, callbacks());

    expect(screen.getByText("Не хватает")).toBeOnTheScreen();
    expect(screen.getByText("20")).toBeOnTheScreen();
  });

  test("shows the plain title when nothing is short", async () => {
    await renderSheet(null, callbacks());

    expect(screen.getByText("Как заработать")).toBeOnTheScreen();
  });

  test("shows both balances", async () => {
    await renderSheet(null, callbacks());

    expect(screen.getByLabelText("Изумруды: 2640")).toBeOnTheScreen();
    expect(screen.getByLabelText("Монеты: 18420")).toBeOnTheScreen();
  });

  test("leads to the daily", async () => {
    const handlers = callbacks();
    await renderSheet(null, handlers);

    await fireEvent.press(screen.getByTestId("earn-daily"));

    expect(handlers.onDaily).toHaveBeenCalled();
  });

  test("credits ◆ 5 for an ad and counts it (ADS-01)", async () => {
    jest.useFakeTimers({ advanceTimers: true });
    await renderSheet(null, callbacks());
    expect(await screen.findByText("сегодня 0 / 5")).toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId("earn-ad"));
    await act(() => jest.advanceTimersByTimeAsync(2000));

    expect(await screen.findByLabelText("Изумруды: 2645")).toBeOnTheScreen();
    expect(await screen.findByText("сегодня 1 / 5")).toBeOnTheScreen();
    jest.useRealTimers();
  });

  test("offers no ad after today's limit (ADS-04)", async () => {
    mockServer.use(
      http.get(mockUrl("/ads/limits"), () =>
        HttpResponse.json({
          gems: { used: 5, max: 5, resetAt: "2026-10-11T00:00:00Z" },
          continue: { used: 0, max: 2, resetAt: "2026-10-11T00:00:00Z" },
          streak: { used: 0, max: 1, resetAt: "2026-10-11T00:00:00Z" },
        }),
      ),
    );
    await renderSheet(null, callbacks());

    expect(await screen.findByText("Снова завтра")).toBeOnTheScreen();
    expect(screen.getByTestId("earn-ad")).toBeDisabled();
  });

  test("tells about a reward still on its way (ADS-02)", async () => {
    jest.useFakeTimers({ advanceTimers: true });
    mockServer.use(
      http.get(mockUrl("/ads/intent/:id"), () => HttpResponse.json({ status: "pending" })),
    );
    const handlers = callbacks();
    await renderSheet(null, handlers);
    await screen.findByText("сегодня 0 / 5");

    await fireEvent.press(screen.getByTestId("earn-ad"));
    await act(() => jest.advanceTimersByTimeAsync(12_000));

    expect(handlers.onMessage).toHaveBeenCalledWith("ads.rewardLater");
    jest.useRealTimers();
  });

  test("closes", async () => {
    const handlers = callbacks();
    await renderSheet(null, handlers);

    await act(async () => fireEvent.press(screen.getByText("Закрыть")));

    expect(handlers.onClose).toHaveBeenCalled();
  });

  test("tells how many coins are short", async () => {
    await render(<EarnSheet isOpen shortBy={1200} currency="coins" {...callbacks()} />, {
      wrapper: createQueryWrapper(),
    });
    await screen.findByLabelText("Изумруды: 2640");

    expect(screen.getByText("1200")).toBeOnTheScreen();
  });
});
