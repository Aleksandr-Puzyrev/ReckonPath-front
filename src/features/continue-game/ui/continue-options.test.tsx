import { render, screen } from "@testing-library/react-native";

import { useAccountStore } from "@entities/session";
import { i18n } from "@shared/i18n";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import ContinueOptions from "./continue-options";

const renderOptions = () =>
  render(
    <ContinueOptions onContinued={jest.fn()} onShortOfEmeralds={jest.fn()} onError={jest.fn()} />,
    {
      wrapper: createQueryWrapper(),
    },
  );

describe("ContinueOptions", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  afterEach(() => useAccountStore.getState().reset());

  test("offers a guest the ad only, without emeralds (decision 0051 #3)", async () => {
    await renderOptions();

    expect(screen.queryByTestId("continue-emeralds")).toBeNull();
  });

  test("offers an account the emeralds as well", async () => {
    useAccountStore.getState().markSignedIn();

    await renderOptions();

    expect(screen.getByTestId("continue-emeralds")).toBeOnTheScreen();
  });
});
