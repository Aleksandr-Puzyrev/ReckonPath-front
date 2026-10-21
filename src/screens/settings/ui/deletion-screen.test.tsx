import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { apiClient } from "@shared/api";
import { i18n } from "@shared/i18n";
import { mockServer } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import DeletionScreen from "./deletion-screen";

const mockRouter = { back: jest.fn() };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
}));

describe("DeletionScreen", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  afterEach(async () => {
    await cleanup();
    mockServer.reset();
    mockRouter.back.mockClear();
  });

  test("shows the deletion date and cancels the deletion (design 26.4, decision 0040 #15)", async () => {
    await apiClient.DELETE("/me", { body: { confirmNickname: "Player4821" } });
    await render(<DeletionScreen />, { wrapper: createQueryWrapper() });

    expect(await screen.findByText(/^Аккаунт будет удалён \d+ \S+$/)).toBeOnTheScreen();
    expect(screen.getByText("Войди до этой даты, чтобы отменить удаление.")).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("deletion-restore"));

    await waitFor(() => expect(mockRouter.back).toHaveBeenCalled());
    expect((await apiClient.GET("/me")).data?.flags.deletionScheduledAt).toBeNull();
  });
});
