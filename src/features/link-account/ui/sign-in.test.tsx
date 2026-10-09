import { act, fireEvent, render, screen } from "@testing-library/react-native";

import { useOutboxStore } from "@entities/outbox";
import { useProgressStore } from "@entities/progress";
import { useAccountStore, useSessionStore } from "@entities/session";
import { i18n } from "@shared/i18n";
import { mockServer } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import SignIn from "./sign-in";

const secureStore = jest.requireMock<{ __reset: () => void }>("expo-secure-store");

const callbacks = () => ({
  onBack: jest.fn(),
  onSignedIn: jest.fn(),
  onSignUp: jest.fn(),
  onError: jest.fn(),
});

const renderSignIn = async (handlers: ReturnType<typeof callbacks>) => {
  await render(<SignIn {...handlers} />, { wrapper: createQueryWrapper() });
};

const signIn = async (password: string) => {
  await fireEvent.changeText(screen.getByTestId("sign-in-login"), "Nova_58");
  await fireEvent.changeText(screen.getByTestId("sign-in-password"), password);
  await act(async () => fireEvent.press(screen.getByTestId("sign-in-submit")));
};

describe("SignIn", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  // Before each test, not after: the mounted form listens to the progress (до каждого теста, а не после: смонтированная форма слушает прогресс).
  beforeEach(() => {
    useSessionStore.getState().reset();
    useAccountStore.getState().reset();
    useProgressStore.getState().reset();
    useOutboxStore.getState().reset();
  });

  afterEach(() => {
    mockServer.reset();
    secureStore.__reset();
  });

  test("shows the field errors on an empty submit", async () => {
    await renderSignIn(callbacks());

    await act(async () => fireEvent.press(screen.getByTestId("sign-in-submit")));

    expect(screen.getByText("Введи ник или e-mail")).toBeOnTheScreen();
    expect(screen.getByText("Пароль — минимум 6 символов")).toBeOnTheScreen();
  });

  test("shows a wrong login or password under the password field", async () => {
    await renderSignIn(callbacks());

    await signIn("000000");

    expect(await screen.findByText("Неверный логин или пароль")).toBeOnTheScreen();
  });

  test("offers the saved account against this device's progress (ACC-06)", async () => {
    useProgressStore.getState().replaceBest({ "c-1": { stars: 3, moves: 1 } });
    await renderSignIn(callbacks());

    await signIn("Signal2026");

    expect(await screen.findByText("Найдено два прогресса")).toBeOnTheScreen();
    expect(screen.getByText("Nova_58")).toBeOnTheScreen();
    expect(screen.getByText("58")).toBeOnTheScreen();
    expect(screen.getByText("GOLD I")).toBeOnTheScreen();
  });

  test("loads the saved account after the confirmation (ACC-06)", async () => {
    useProgressStore.getState().replaceBest({ "c-1": { stars: 3, moves: 1 } });
    const handlers = callbacks();
    await renderSignIn(handlers);
    await signIn("Signal2026");
    await screen.findByText("Найдено два прогресса");

    await fireEvent.press(screen.getByTestId("conflict-load"));
    expect(screen.getByText("Оставить «Nova_58»?")).toBeOnTheScreen();
    await act(async () => fireEvent.press(screen.getByText("Оставить")));

    expect(handlers.onSignedIn).toHaveBeenCalled();
    expect(useProgressStore.getState().best).toEqual({});
  });

  test("returns to the form on cancel, keeping the guest (ACC-06)", async () => {
    useProgressStore.getState().replaceBest({ "c-1": { stars: 3, moves: 1 } });
    const handlers = callbacks();
    await renderSignIn(handlers);
    await signIn("Signal2026");
    await screen.findByText("Найдено два прогресса");

    await act(async () => fireEvent.press(screen.getByText("Отмена")));

    expect(screen.getByTestId("sign-in-submit")).toBeOnTheScreen();
    expect(handlers.onSignedIn).not.toHaveBeenCalled();
    expect(useProgressStore.getState().best).toEqual({ "c-1": { stars: 3, moves: 1 } });
  });
});
