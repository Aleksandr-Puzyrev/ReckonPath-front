import { act, fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { i18n } from "@shared/i18n";
import { mockServer } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import EarnSheet from "./earn-sheet";

jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));

const callbacks = () => ({ onDaily: jest.fn(), onClose: jest.fn() });

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

  test("closes", async () => {
    const handlers = callbacks();
    await renderSheet(null, handlers);

    await act(async () => fireEvent.press(screen.getByText("Закрыть")));

    expect(handlers.onClose).toHaveBeenCalled();
  });
});
