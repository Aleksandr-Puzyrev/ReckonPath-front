import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import { useMatchStore } from "@entities/match";
import { i18n } from "@shared/i18n";
import { doneMatchMock, mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import ArenaResultScreen from "./arena-result-screen";

const mockRouter = { back: jest.fn(), replace: jest.fn(), push: jest.fn() };
const mockInterstitial = { finishLevel: jest.fn(), showIfDue: jest.fn(async () => undefined) };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
  useLocalSearchParams: () => ({ id: "match-done" }),
}));
jest.mock("@shared/config", () => ({
  ...jest.requireActual("@shared/config"),
  HAS_ARENA_SERVER: true,
}));
jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));
jest.mock("@widgets/board", () => ({ BoardMapPreview: () => null }));
jest.mock("@features/show-interstitial", () => ({ useInterstitial: () => mockInterstitial }));

const HTTP_NO_CONTENT = 204;

type MatchOverrides = NonNullable<Parameters<typeof doneMatchMock>[0]>;

const finishAgainst = (
  rival: Partial<ReturnType<typeof doneMatchMock>["rival"]>,
  overrides: MatchOverrides = {},
) => {
  const done = doneMatchMock(overrides);
  useMatchStore.getState().receive({ ...done, rival: { ...done.rival, ...rival } });
};

const renderResult = () => render(<ArenaResultScreen />, { wrapper: createQueryWrapper() });

const openMenu = async () => {
  await fireEvent.press(await screen.findByTestId("result-more"));
};

describe("ArenaResultScreen rival actions (decision 0066 #10)", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => mockRouter.push.mockClear());

  afterEach(async () => {
    await cleanup();
    useMatchStore.getState().reset();
    mockServer.reset();
  });

  test("sends a friend request to a live rival and marks it sent", async () => {
    finishAgainst({ id: "player-7", name: "Miron" });
    await renderResult();

    const add = await screen.findByTestId("result-add-friend");
    expect(add).toHaveTextContent("+ В друзья");
    await act(async () => fireEvent.press(add));

    await waitFor(() =>
      expect(screen.getByTestId("result-add-friend")).toHaveTextContent("Заявка ✓"),
    );
    expect(screen.getByTestId("result-add-friend")).toBeDisabled();
  });

  test("offers no friend request to a friend", async () => {
    finishAgainst({ id: "mock-2", name: "Kira" });
    await renderResult();

    await screen.findByTestId("result-more");
    expect(screen.queryByTestId("result-add-friend")).toBeNull();
  });

  test("offers no friend request after a friendly match", async () => {
    finishAgainst({ id: "player-7", name: "Miron" }, { friendly: true });
    await renderResult();

    await screen.findByTestId("result-more");
    expect(screen.queryByTestId("result-add-friend")).toBeNull();
  });

  test("offers neither a friend request nor the menu for a bot", async () => {
    finishAgainst({ id: undefined, name: "Bot", bot: true }, { kind: "bot" });
    await renderResult();

    expect(screen.getByText("Победа")).toBeOnTheScreen();
    expect(screen.queryByTestId("result-add-friend")).toBeNull();
    expect(screen.queryByTestId("result-more")).toBeNull();
  });

  test("reports the rival with the match id and marks the reason sent (design 17.6)", async () => {
    const bodies: unknown[] = [];
    mockServer.use(
      http.post(mockUrl("/users/:id/report"), async ({ request }) => {
        bodies.push(await request.json());
        return new HttpResponse(null, { status: HTTP_NO_CONTENT });
      }),
    );
    finishAgainst({ id: "player-7", name: "Miron" });
    await renderResult();
    await openMenu();

    await act(async () => fireEvent.press(screen.getByTestId("report-nickname")));

    expect(await screen.findByText("Жалоба отправлена")).toBeOnTheScreen();
    expect(bodies).toEqual([{ reason: "nickname", matchId: "match-done" }]);
    expect(screen.getByTestId("report-nickname")).toHaveTextContent(
      "Оскорбительный никОтправлено ✓",
    );
    expect(screen.getByTestId("report-nickname")).toBeDisabled();
  });

  test("tells when the player was already reported today (L13)", async () => {
    finishAgainst({ id: "player-7", name: "Miron" });
    await renderResult();
    await openMenu();

    await act(async () => fireEvent.press(screen.getByTestId("report-nickname")));
    await screen.findByText("Отправлено ✓");
    await act(async () => fireEvent.press(screen.getByTestId("report-cheating")));

    expect(
      await screen.findByText("Жалоба на этого игрока уже отправлена сегодня"),
    ).toBeOnTheScreen();
  });

  test("blocks the rival after the confirmation and shows him blocked", async () => {
    finishAgainst({ id: "player-7", name: "Miron" });
    await renderResult();
    await screen.findByTestId("result-add-friend");
    await openMenu();

    await fireEvent.press(screen.getByTestId("result-block"));
    expect(screen.getByText("Заблокировать Miron?")).toBeOnTheScreen();
    await act(async () => fireEvent.press(screen.getByTestId("block-confirm")));

    expect(await screen.findByText("Игрок Miron заблокирован")).toBeOnTheScreen();
    await waitFor(() => expect(screen.queryByTestId("result-add-friend")).toBeNull());
    await openMenu();
    expect(screen.getByTestId("result-block")).toHaveTextContent("ЗаблокироватьЗаблокирован");
    expect(screen.getByTestId("result-block")).toBeDisabled();
  });

  test("opens the rival's profile from his name in the menu (decision 0066 #9)", async () => {
    finishAgainst({ id: "player-7", name: "Miron" });
    await renderResult();
    await openMenu();

    await fireEvent.press(screen.getByLabelText("Открыть профиль Miron"));

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/user/[id]",
      params: { id: "player-7" },
    });
  });
});
