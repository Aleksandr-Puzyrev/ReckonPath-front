import { onlineManager } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react-native";

import { useAccountStore } from "@entities/session";
import { i18n } from "@shared/i18n";
import { mockServer } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import ArenaLeaders from "./arena-leaders";

const onOpenAll = jest.fn();
const onOpenProfile = jest.fn();

const renderLeaders = async (isOnline = true) => {
  useAccountStore.getState().markSignedIn();
  await render(
    <ArenaLeaders isOnline={isOnline} onOpenAll={onOpenAll} onOpenProfile={onOpenProfile} />,
    { wrapper: createQueryWrapper() },
  );
};

describe("ArenaLeaders (decision 0066 #4)", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => jest.clearAllMocks());

  afterEach(async () => {
    await cleanup();
    mockServer.reset();
    useAccountStore.getState().reset();
    await act(async () => onlineManager.setOnline(true));
  });

  test("shows the weekly top 3 and the hint without a row of mine", async () => {
    await renderLeaders();

    expect(await screen.findByText("Nova")).toBeOnTheScreen();
    expect(screen.getByText("Kira")).toBeOnTheScreen();
    expect(screen.getByText("Vera")).toBeOnTheScreen();
    expect(screen.queryByText("Gleb")).toBeNull();
    expect(screen.getByTestId("leaders-no-me")).toHaveTextContent(
      "Сыграй матч на этой неделе, чтобы попасть в таблицу",
    );
  });

  test("switches to the season and adds my row below the top", async () => {
    await renderLeaders();
    await screen.findByText("Nova");

    await fireEvent.press(screen.getByTestId("leaders-period-season"));

    expect(await screen.findByText("Ты")).toBeOnTheScreen();
    expect(screen.getByLabelText(/^6 место, Ты, /)).toBeOnTheScreen();
    expect(screen.queryByTestId("leaders-no-me")).toBeNull();
  });

  test("opens a player's profile and all leaderboards", async () => {
    await renderLeaders();

    await fireEvent.press(await screen.findByTestId("leader-mock-2"));
    await fireEvent.press(screen.getByTestId("leaders-all"));

    expect(onOpenProfile).toHaveBeenCalledWith("mock-2");
    expect(onOpenAll).toHaveBeenCalled();
  });

  test("hides itself offline without a cached board", async () => {
    await act(async () => onlineManager.setOnline(false));
    await renderLeaders(false);

    expect(screen.queryByTestId("arena-leaders")).toBeNull();
  });
});
