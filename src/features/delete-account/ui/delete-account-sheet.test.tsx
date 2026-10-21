import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { Text } from "react-native";

import { i18n } from "@shared/i18n";
import { mockServer } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import DeleteAccountSheet from "./delete-account-sheet";

jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));

const sheetWith = (isOpen: boolean, onScheduled = jest.fn()) => (
  <DeleteAccountSheet
    isOpen={isOpen}
    nickname="Player4821"
    summary={<Text>summary</Text>}
    onScheduled={onScheduled}
    onError={jest.fn()}
    onClose={jest.fn()}
  />
);

describe("DeleteAccountSheet", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  afterEach(async () => {
    await cleanup();
    mockServer.reset();
  });

  test("starts again from «Что удалится» after a deletion (design 26.3)", async () => {
    const onScheduled = jest.fn();
    const Wrapper = createQueryWrapper();
    const { rerender } = await render(sheetWith(true, onScheduled), { wrapper: Wrapper });
    await fireEvent.press(screen.getByTestId("delete-continue"));
    await fireEvent.changeText(screen.getByTestId("delete-nickname"), "Player4821");
    await waitFor(() => expect(screen.getByTestId("delete-forever")).toBeEnabled());
    await fireEvent.press(screen.getByTestId("delete-forever"));
    await waitFor(() => expect(onScheduled).toHaveBeenCalled());

    await rerender(sheetWith(false, onScheduled));
    await rerender(sheetWith(true, onScheduled));

    expect(screen.getByText("Что удалится")).toBeOnTheScreen();
  });
});
