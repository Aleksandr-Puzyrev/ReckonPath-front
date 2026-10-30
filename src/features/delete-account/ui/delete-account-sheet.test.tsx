import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { Text } from "react-native";

import { useAccountStore } from "@entities/session";
import { useProgressStore } from "@entities/progress";
import { i18n } from "@shared/i18n";
import { mockServer } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import DeleteAccountSheet from "./delete-account-sheet";

jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));

const sheetWith = (isOpen: boolean, onDeleted = jest.fn()) => (
  <DeleteAccountSheet
    isOpen={isOpen}
    summary={<Text>summary</Text>}
    onDeleted={onDeleted}
    onError={jest.fn()}
    onClose={jest.fn()}
  />
);

const confirmWith = async (password: string) => {
  await fireEvent.press(screen.getByTestId("delete-continue"));
  await fireEvent.changeText(screen.getByTestId("delete-password"), password);
  await waitFor(() => expect(screen.getByTestId("delete-forever")).toBeEnabled());
  await fireEvent.press(screen.getByTestId("delete-forever"));
};

describe("DeleteAccountSheet", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  beforeEach(() => useAccountStore.getState().markSignedIn());

  afterEach(async () => {
    await cleanup();
    mockServer.reset();
    useAccountStore.getState().reset();
    useProgressStore.getState().reset();
  });

  test("asks for the password (decision 0052 #2)", async () => {
    await render(sheetWith(true), { wrapper: createQueryWrapper() });

    await fireEvent.press(screen.getByTestId("delete-continue"));

    expect(screen.getByText("Введи пароль, чтобы подтвердить удаление")).toBeOnTheScreen();
    expect(screen.getByTestId("delete-forever")).toBeDisabled();
  });

  test("turns the device into a guest after the deletion", async () => {
    useProgressStore.getState().recordWin("c-1", { stars: 3, moves: 4 });
    const onDeleted = jest.fn();
    await render(sheetWith(true, onDeleted), { wrapper: createQueryWrapper() });

    await confirmWith("Signal2026");

    await waitFor(() => expect(onDeleted).toHaveBeenCalledWith(expect.any(String)));
    expect(useAccountStore.getState().hasLogin).toBe(false);
    expect(useProgressStore.getState().best).toEqual({});
  });

  test("shows a wrong password under the field", async () => {
    const onDeleted = jest.fn();
    await render(sheetWith(true, onDeleted), { wrapper: createQueryWrapper() });

    await confirmWith("000000");

    expect(await screen.findByText("Неверный логин или пароль")).toBeOnTheScreen();
    expect(onDeleted).not.toHaveBeenCalled();
    expect(useAccountStore.getState().hasLogin).toBe(true);
  });

  test("starts again from «Что удалится» after a deletion (design 26.3)", async () => {
    const onDeleted = jest.fn();
    const Wrapper = createQueryWrapper();
    const { rerender } = await render(sheetWith(true, onDeleted), { wrapper: Wrapper });
    await confirmWith("Signal2026");
    await waitFor(() => expect(onDeleted).toHaveBeenCalled());

    await rerender(sheetWith(false, onDeleted));
    await rerender(sheetWith(true, onDeleted));

    expect(screen.getByText("Что удалится")).toBeOnTheScreen();
  });
});
