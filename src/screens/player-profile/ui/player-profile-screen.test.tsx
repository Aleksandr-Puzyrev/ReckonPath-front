import { onlineManager } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import { useAccountStore } from "@entities/session";
import { i18n } from "@shared/i18n";
import { formatNumber } from "@shared/lib";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import PlayerProfileScreen from "./player-profile-screen";

const mockRouter = { back: jest.fn(), replace: jest.fn(), push: jest.fn(), canGoBack: () => true };
let mockParams = { id: "player-8" };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
  useLocalSearchParams: () => mockParams,
  useNavigation: () => ({ dispatch: jest.fn(), canGoBack: () => true }),
}));
jest.mock("expo-router/react-navigation", () => ({ usePreventRemove: () => undefined }));
jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));

const HTTP_SERVER_ERROR = 500;
const HTTP_NOT_FOUND = 404;
const DAY_MS = 86_400_000;

const renderProfile = async (id: string) => {
  mockParams = { id };
  useAccountStore.getState().markSignedIn();
  await render(<PlayerProfileScreen />, { wrapper: createQueryWrapper() });
};

describe("PlayerProfileScreen (decision 0066 #5)", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => mockRouter.replace.mockClear());

  afterEach(async () => {
    await cleanup();
    mockServer.reset();
    useAccountStore.getState().reset();
    await act(async () => onlineManager.setOnline(true));
  });

  test("shows the skeleton while the profile loads", async () => {
    let respond = () => {};
    mockServer.use(
      http.get(
        mockUrl("/arena/players/:id"),
        () =>
          new Promise<Response>((resolve) => {
            respond = () =>
              resolve(
                HttpResponse.json(
                  { error: { code: "player_not_found" } },
                  { status: HTTP_NOT_FOUND },
                ),
              );
          }),
      ),
    );
    await renderProfile("player-8");

    expect(
      screen.getByTestId("player-skeleton", { includeHiddenElements: true }),
    ).toBeOnTheScreen();
    await act(async () => respond());
  });

  test("shows the name, the league, the world place and the arena stats", async () => {
    await renderProfile("player-8");

    expect(await screen.findByText(`SILVER I · ${formatNumber(1990, "ru")}`)).toBeOnTheScreen();
    expect(screen.getByText("Профиль игрока")).toBeOnTheScreen();
    expect(screen.getByTestId("player-rank")).toHaveTextContent(
      `Место #${formatNumber(3010, "ru")} в мире`,
    );
    expect(screen.getByTestId("player-stat-wins")).toHaveTextContent(/^Победы50 · 66\s%$/u);
    expect(screen.getByTestId("player-stat-peak")).toHaveTextContent(
      `Пик${formatNumber(2110, "ru")}`,
    );
    expect(screen.getByTestId("player-stat-streak")).toHaveTextContent("Серия0 / 3");
  });

  test("shows the head to head with the last match as a relative day", async () => {
    mockServer.use(
      http.get(mockUrl("/arena/players/:id"), () =>
        HttpResponse.json({
          id: "player-9",
          name: "Kira",
          trophies: 2910,
          rank: 41,
          league: { league: "gold", title: "Gold", division: "I", min: 2800 },
          look: {},
          stats: {
            matches: 1,
            wins: 1,
            losses: 0,
            draws: 0,
            winRate: 100,
            streak: 1,
            bestStreak: 1,
            peak: 2910,
          },
          headToHead: {
            wins: 3,
            losses: 2,
            draws: 0,
            last: [
              {
                matchId: "m1",
                kind: "duel",
                outcome: "win",
                reason: "targets",
                rival: { id: "player-9", name: "Kira" },
                moves: 9,
                rivalMoves: 10,
                trophies: 16,
                finishedAt: new Date(Date.now() - DAY_MS).toISOString(),
              },
            ],
          },
          relation: "none",
        }),
      ),
    );
    await renderProfile("player-9");

    expect(await screen.findByText("ты · Kira · последний матч вчера")).toBeOnTheScreen();
    expect(screen.getByLabelText("3 : 2")).toBeOnTheScreen();
  });

  test("says the players have not met yet without meetings", async () => {
    await renderProfile("mock-1");

    expect(await screen.findByText("Ещё не встречались")).toBeOnTheScreen();
  });

  test("says the player is not found (404 player_not_found)", async () => {
    await renderProfile("nobody");

    expect(await screen.findByText("Игрок не найден")).toBeOnTheScreen();
    expect(screen.queryByTestId("player-retry")).toBeNull();
  });

  test("offers to try again after an error with its code", async () => {
    mockServer.use(
      http.get(
        mockUrl("/arena/players/:id"),
        () =>
          HttpResponse.json({ error: { code: "internal_error" } }, { status: HTTP_SERVER_ERROR }),
        { once: true },
      ),
    );
    await renderProfile("player-8");

    const retry = await screen.findByTestId("player-retry");
    expect(screen.getByTestId("player-error-code")).toHaveTextContent("internal_error");
    await act(async () => fireEvent.press(retry));

    expect(await screen.findByText("Gleb")).toBeOnTheScreen();
  });

  test("keeps the cached profile with the offline bar and the actions off (decision 0066 #15)", async () => {
    await renderProfile("player-8");
    await screen.findByText("Gleb");

    await act(async () => onlineManager.setOnline(false));

    expect(screen.getByTestId("player-offline")).toHaveTextContent("Нет сети");
    expect(screen.getByText("Gleb")).toBeOnTheScreen();
    expect(screen.getByTestId("player-add")).toBeDisabled();
    expect(screen.getByLabelText("Ещё")).toBeDisabled();
  });

  test("shows the offline bar once when there is no cache", async () => {
    await act(async () => onlineManager.setOnline(false));
    await renderProfile("player-8");

    expect(screen.getAllByText("Нет сети")).toHaveLength(1);
  });

  test("opens the Profile tab for my own id (decision 0066 #11)", async () => {
    await renderProfile("me");

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith("/profile"));
    expect(screen.queryByText("Player4821")).toBeNull();
    expect(screen.queryByLabelText("Ещё")).toBeNull();
  });
});
