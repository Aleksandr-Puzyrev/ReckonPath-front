import { fireEvent, render, screen } from "@testing-library/react-native";

import { useAccountStore } from "@entities/session";
import { i18n } from "@shared/i18n";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import ShopTab from "./shop-tab";

const mockRouter = { push: jest.fn() };

jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
}));
jest.mock("./shop-screen", () => {
  const { Text } = jest.requireActual("react-native");
  const MockContent = () => <Text>content</Text>;
  return MockContent;
});

const renderTab = () => render(<ShopTab />, { wrapper: createQueryWrapper() });

describe("ShopTab", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  afterEach(() => {
    mockRouter.push.mockClear();
    useAccountStore.getState().reset();
  });

  test("asks a guest for an account (decision 0051 #1)", async () => {
    await renderTab();

    expect(screen.getByText("Витрина — для аккаунта")).toBeOnTheScreen();
    expect(screen.queryByText("content")).toBeNull();
    await fireEvent.press(screen.getByTestId("guest-sign-up"));
    expect(mockRouter.push).toHaveBeenCalledWith("/account/sign-up");
  });

  test("opens the tab for an account", async () => {
    useAccountStore.getState().markSignedIn();

    await renderTab();

    expect(screen.getByText("content")).toBeOnTheScreen();
  });
});
