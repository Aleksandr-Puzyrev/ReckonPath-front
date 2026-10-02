import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { Linking } from "react-native";

import { i18n } from "@shared/i18n";

import SoftUpdateSheet from "./soft-update-sheet";

jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));

const STORE_URL = "https://apps.apple.com/app/id000";

const renderSheet = (onDismiss = jest.fn()) =>
  render(
    <SoftUpdateSheet
      isOpen
      version="1.5.0"
      storeUrl={STORE_URL}
      message="Новый мир «Туман»"
      onDismiss={onDismiss}
    />,
  );

describe("SoftUpdateSheet", () => {
  beforeEach(() => i18n.changeLanguage("ru"));

  test("shows the new version and the text from the admin panel", async () => {
    await renderSheet();

    expect(await screen.findByText("Вышла версия 1.5.0")).toBeOnTheScreen();
    expect(screen.getByText("Новый мир «Туман»")).toBeOnTheScreen();
  });

  test("«Позже» closes the sheet", async () => {
    const onDismiss = jest.fn();
    await renderSheet(onDismiss);

    await fireEvent.press(await screen.findByRole("button", { name: "Позже" }));

    expect(onDismiss).toHaveBeenCalled();
  });

  test("«Обновить» opens the store and closes the sheet", async () => {
    const openURL = jest.spyOn(Linking, "openURL").mockResolvedValue(true);
    const onDismiss = jest.fn();
    await renderSheet(onDismiss);

    await fireEvent.press(await screen.findByRole("button", { name: "Обновить" }));

    expect(openURL).toHaveBeenCalledWith(STORE_URL);
    expect(onDismiss).toHaveBeenCalled();
  });
});
