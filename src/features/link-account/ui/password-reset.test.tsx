import { act, fireEvent, render, screen } from "@testing-library/react-native";

import { MOCK_CODE, MOCK_REJECTED_PASSWORD } from "@shared/api/mocks/auth-handlers";
import { i18n } from "@shared/i18n";
import { mockServer } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import PasswordReset from "./password-reset";

const EMAIL = "nova@mail.ru";

const callbacks = () => ({ onBack: jest.fn(), onReset: jest.fn(), onError: jest.fn() });

const renderReset = async (handlers: ReturnType<typeof callbacks>) => {
  await render(<PasswordReset initialEmail={EMAIL} {...handlers} />, {
    wrapper: createQueryWrapper(),
  });
};

const sendCode = () => act(async () => fireEvent.press(screen.getByTestId("forgot-send")));

const save = async (code: string, password: string) => {
  await fireEvent.changeText(screen.getByTestId("forgot-code"), code);
  await fireEvent.changeText(screen.getByTestId("forgot-password"), password);
  await act(async () => fireEvent.press(screen.getByTestId("forgot-save")));
};

describe("PasswordReset (decision 0053 #9)", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  afterEach(() => {
    mockServer.reset();
    jest.useRealTimers();
  });

  test("sends the code to the e-mail typed on sign-in", async () => {
    await renderReset(callbacks());
    expect(screen.getByText("Пришлём код на e-mail аккаунта")).toBeOnTheScreen();

    await sendCode();

    expect(
      await screen.findByText(`Если аккаунт с адресом ${EMAIL} есть, мы отправили на него код.`),
    ).toBeOnTheScreen();
  });

  test("saves the new password with the code", async () => {
    const handlers = callbacks();
    await renderReset(handlers);
    await sendCode();

    await save(MOCK_CODE, "Signal2026");

    expect(handlers.onReset).toHaveBeenCalledWith(EMAIL);
  });

  test("shows a wrong code under the code field", async () => {
    const handlers = callbacks();
    await renderReset(handlers);
    await sendCode();

    await save("000000", "Signal2026");

    expect(await screen.findByText("Неверный код")).toBeOnTheScreen();
    expect(handlers.onReset).not.toHaveBeenCalled();
  });

  test("shows a password the server rejects under the password field", async () => {
    await renderReset(callbacks());
    await sendCode();

    await save(MOCK_CODE, MOCK_REJECTED_PASSWORD);

    expect(await screen.findByText("Пароль слишком простой — придумай другой")).toBeOnTheScreen();
  });

  test("lets the code be sent again after the countdown", async () => {
    jest.useFakeTimers();
    await renderReset(callbacks());
    await sendCode();
    expect(await screen.findByText("Отправить ещё раз через 1:00")).toBeOnTheScreen();

    await act(async () => jest.advanceTimersByTime(60_000));

    expect(screen.getByText("Отправить код ещё раз")).toBeOnTheScreen();
  });
});
