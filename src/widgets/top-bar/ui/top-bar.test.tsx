import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import { i18n } from "@shared/i18n";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";

import TopBar from "./top-bar";

const renderBar = async (onWalletPress: () => void) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  await render(<TopBar onWalletPress={onWalletPress} />, { wrapper });
  await waitFor(() => expect(queryClient.isFetching()).toBe(0));
  // Query updates reach the component on the next macrotask (обновления запроса доходят до компонента на следующей макрозадаче).
  await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
};

describe("TopBar", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  afterEach(() => mockServer.reset());

  test("shows the brand", async () => {
    await renderBar(jest.fn());

    expect(screen.getByLabelText("Знак Reckon Path")).toBeOnTheScreen();
    expect(screen.getByText("SIGNAL HUNT")).toBeOnTheScreen();
  });

  test("shows the balance from the player's data (LVL-26)", async () => {
    await renderBar(jest.fn());

    expect(screen.getByLabelText("Изумруды: 2640")).toBeOnTheScreen();
    expect(screen.getByLabelText("Монеты: 18420")).toBeOnTheScreen();
  });

  test("hides the balance until the player's data arrives", async () => {
    mockServer.use(http.get(mockUrl("/me"), () => HttpResponse.error()));
    await renderBar(jest.fn());

    expect(screen.queryByTestId("wallet-emeralds")).toBeNull();
    expect(screen.queryByTestId("wallet-coins")).toBeNull();
  });

  test.each(["wallet-emeralds", "wallet-coins"])("opens the wallet from %s", async (testID) => {
    const onWalletPress = jest.fn();
    await renderBar(onWalletPress);

    await fireEvent.press(screen.getByTestId(testID));

    expect(onWalletPress).toHaveBeenCalled();
  });
});
