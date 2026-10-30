import { act, fireEvent, render, screen } from "@testing-library/react-native";

import { useAccountStore, useSessionStore } from "@entities/session";
import { MOCK_CODE } from "@shared/api/mocks/auth-handlers";
import { i18n } from "@shared/i18n";
import { mockServer } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import EmailCode from "./email-code";

const secureStore = jest.requireMock<{ __reset: () => void }>("expo-secure-store");

const EMAIL = "seeker@reckon.app";
const RESEND_AFTER_S = 60;

const callbacks = () => ({ onBack: jest.fn(), onConfirmed: jest.fn(), onError: jest.fn() });

const renderCode = async (handlers: ReturnType<typeof callbacks>) => {
  await render(<EmailCode email={EMAIL} resendAfter={RESEND_AFTER_S} {...handlers} />, {
    wrapper: createQueryWrapper(),
  });
};

const enter = async (code: string) => {
  await fireEvent.changeText(screen.getByTestId("email-code"), code);
  await act(async () => fireEvent.press(screen.getByTestId("email-code-submit")));
};

describe("EmailCode", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  afterEach(() => {
    mockServer.reset();
    secureStore.__reset();
    useSessionStore.getState().reset();
    useAccountStore.getState().reset();
    jest.useRealTimers();
  });

  test("tells where the code went (decision 0050 #2)", async () => {
    await renderCode(callbacks());

    expect(
      screen.getByText(
        `Мы отправили код на ${EMAIL}. Если этот адрес уже зарегистрирован, в письме будет ссылка на вход.`,
      ),
    ).toBeOnTheScreen();
  });

  test("opens the new account with the right code", async () => {
    const handlers = callbacks();
    await renderCode(handlers);

    await enter(MOCK_CODE);

    expect(handlers.onConfirmed).toHaveBeenCalled();
    expect(useAccountStore.getState()).toMatchObject({ hasLogin: true, linkedNotice: 1 });
  });

  test("shows a wrong code under the field", async () => {
    const handlers = callbacks();
    await renderCode(handlers);

    await enter("000000");

    expect(await screen.findByText("Неверный код")).toBeOnTheScreen();
    expect(handlers.onConfirmed).not.toHaveBeenCalled();
  });

  test("lets the code be sent again after the countdown", async () => {
    jest.useFakeTimers();
    await renderCode(callbacks());
    expect(screen.getByText("Отправить ещё раз через 1:00")).toBeOnTheScreen();

    await act(async () => jest.advanceTimersByTime(RESEND_AFTER_S * 1000));
    await act(async () => fireEvent.press(screen.getByText("Отправить код ещё раз")));

    expect(await screen.findByText("Отправить ещё раз через 1:00")).toBeOnTheScreen();
  });
});
