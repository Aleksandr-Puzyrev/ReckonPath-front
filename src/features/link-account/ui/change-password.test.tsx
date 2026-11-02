import { act, fireEvent, render, screen } from "@testing-library/react-native";

import { MOCK_REJECTED_PASSWORD, MOCK_WRONG_PASSWORD } from "@shared/api/mocks/auth-handlers";
import { i18n } from "@shared/i18n";
import { mockServer } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import ChangePassword from "./change-password";

const callbacks = () => ({ onBack: jest.fn(), onChanged: jest.fn(), onError: jest.fn() });

const change = async (handlers: ReturnType<typeof callbacks>, current: string, next: string) => {
  await render(<ChangePassword {...handlers} />, { wrapper: createQueryWrapper() });
  await fireEvent.changeText(screen.getByTestId("change-current-password"), current);
  await fireEvent.changeText(screen.getByTestId("change-new-password"), next);
  await act(async () => fireEvent.press(screen.getByTestId("change-password-save")));
};

describe("ChangePassword (decision 0053 #11)", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  afterEach(() => mockServer.reset());

  test("saves the new password", async () => {
    const handlers = callbacks();

    await change(handlers, "Signal2026", "Beacon2027");

    expect(handlers.onChanged).toHaveBeenCalled();
  });

  test("shows a wrong current password under its field", async () => {
    const handlers = callbacks();

    await change(handlers, MOCK_WRONG_PASSWORD, "Beacon2027");

    expect(await screen.findByText("Неверный пароль")).toBeOnTheScreen();
    expect(handlers.onChanged).not.toHaveBeenCalled();
  });

  test("shows a new password the server rejects under its field", async () => {
    await change(callbacks(), "Signal2026", MOCK_REJECTED_PASSWORD);

    expect(await screen.findByText("Пароль слишком простой — придумай другой")).toBeOnTheScreen();
  });
});
