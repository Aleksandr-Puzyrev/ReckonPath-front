import { act, fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { useAccountStore } from "@entities/session";
import { i18n } from "@shared/i18n";

import LinkOfferHost from "./link-offer-host";

const mockRouter = { push: jest.fn() };
const mockSegments = ["(tabs)"];

jest.mock("expo-router", () => ({
  useSegments: () => mockSegments,
  get router() {
    return mockRouter;
  },
}));
jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));

describe("LinkOfferHost", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => {
    mockSegments[0] = "(tabs)";
    mockRouter.push.mockClear();
    useAccountStore.getState().reset();
  });

  test("shows the link sheet when an offer is queued", async () => {
    await render(<LinkOfferHost isSuspended={false} />);
    expect(screen.queryByText("Сохрани прогресс")).toBeNull();

    await act(async () => useAccountStore.getState().requestLevelOffer());

    expect(screen.getByText("Сохрани прогресс")).toBeOnTheScreen();
  });

  test("keeps the offer for the tabs while another screen is open", async () => {
    mockSegments[0] = "play";
    useAccountStore.getState().requestLevelOffer();

    await render(<LinkOfferHost isSuspended={false} />);

    expect(screen.queryByText("Сохрани прогресс")).toBeNull();
    expect(useAccountStore.getState().offer).toBe("level");
  });

  test("gives way to a technical sheet", async () => {
    useAccountStore.getState().requestLevelOffer();

    await render(<LinkOfferHost isSuspended />);

    expect(screen.queryByText("Сохрани прогресс")).toBeNull();
  });

  test("closes the offer for later", async () => {
    useAccountStore.getState().requestLevelOffer();
    await render(<LinkOfferHost isSuspended={false} />);

    await fireEvent.press(screen.getByText("Позже"));

    expect(useAccountStore.getState().offer).toBeNull();
    expect(screen.queryByText("Сохрани прогресс")).toBeNull();
  });

  test.each([
    ["link-sign-up", "/account/sign-up"],
    ["link-sign-in", "/account/sign-in"],
  ])("opens the form from %s", async (testID, route) => {
    useAccountStore.getState().requestLevelOffer();
    await render(<LinkOfferHost isSuspended={false} />);

    await fireEvent.press(screen.getByTestId(testID));

    expect(mockRouter.push).toHaveBeenCalledWith(route);
    expect(useAccountStore.getState().offer).toBeNull();
  });

  test("tells that the account is linked after a sign-up", async () => {
    await render(<LinkOfferHost isSuspended={false} />);

    await act(async () => useAccountStore.getState().markRegistered());

    expect(screen.getByText("Аккаунт привязан")).toBeOnTheScreen();
  });
});
