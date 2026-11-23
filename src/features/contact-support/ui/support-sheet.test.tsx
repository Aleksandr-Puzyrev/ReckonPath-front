import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";

import type { SupportTopic } from "@entities/support";
import { i18n } from "@shared/i18n";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import SupportSheet from "./support-sheet";

jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));

const renderSheet = async (topic: SupportTopic) => {
  const callbacks = { onSent: jest.fn(), onError: jest.fn(), onClose: jest.fn() };
  await render(<SupportSheet isOpen topic={topic} title="Поддержка" {...callbacks} />, {
    wrapper: createQueryWrapper(),
  });
  return callbacks;
};

describe("SupportSheet", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  afterEach(async () => {
    await cleanup();
    mockServer.reset();
  });

  test("asks about a question in support (decision 0064 #3)", async () => {
    await renderSheet("support");

    expect(screen.getByText("Опиши вопрос или проблему")).toBeOnTheScreen();
  });

  test("asks about what happened in an appeal (decision 0038 #5)", async () => {
    await renderSheet("ban_appeal");

    expect(screen.getByText("Опиши, что произошло")).toBeOnTheScreen();
  });

  test("keeps the text when there is no network (decision 0064 #7)", async () => {
    mockServer.use(http.post(mockUrl("/support/tickets"), () => HttpResponse.error()));
    const { onError, onClose } = await renderSheet("support");

    await fireEvent.changeText(screen.getByTestId("support-message"), "Не грузится дейли");
    await waitFor(() => expect(screen.getByTestId("support-send")).toBeEnabled());
    await fireEvent.press(screen.getByTestId("support-send"));

    await waitFor(() => expect(onError).toHaveBeenCalledWith("errors.NETWORK"));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue("Не грузится дейли")).toBeOnTheScreen();
  });
});
