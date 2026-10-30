import { act, fireEvent, render, screen } from "@testing-library/react-native";

import { useAccountStore } from "@entities/session";
import { i18n } from "@shared/i18n";
import { mockServer } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import SignUp from "./sign-up";

const callbacks = () => ({
  onBack: jest.fn(),
  onCodeSent: jest.fn(),
  onSignIn: jest.fn(),
  onError: jest.fn(),
});

const renderSignUp = async (handlers: ReturnType<typeof callbacks>) => {
  await render(<SignUp {...handlers} />, { wrapper: createQueryWrapper() });
};

const fill = async (nickname: string) => {
  await fireEvent.changeText(screen.getByTestId("sign-up-nickname"), nickname);
  await fireEvent.changeText(screen.getByTestId("sign-up-email"), "seeker@reckon.app");
  await fireEvent.changeText(screen.getByTestId("sign-up-password"), "Signal2026");
  await fireEvent.press(screen.getByTestId("sign-up-consent"));
};

const submit = () => act(async () => fireEvent.press(screen.getByTestId("sign-up-submit")));

describe("SignUp", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  afterEach(() => {
    mockServer.reset();
    useAccountStore.getState().reset();
  });

  test("shows every field error on an empty submit", async () => {
    await renderSignUp(callbacks());

    await submit();

    expect(screen.getByText("Ник — от 3 до 16 символов")).toBeOnTheScreen();
    expect(screen.getByText("Проверь e-mail")).toBeOnTheScreen();
    expect(screen.getByText("Слишком простой пароль")).toBeOnTheScreen();
    expect(screen.getByText("Нужно согласие с условиями")).toBeOnTheScreen();
  });

  test("rates the password while it is typed", async () => {
    await renderSignUp(callbacks());
    expect(screen.getByText("8+ символов, цифра и заглавная буква")).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByTestId("sign-up-password"), "Signal2026");

    expect(screen.getByText("Хороший")).toBeOnTheScreen();
  });

  test("counts the nickname characters", async () => {
    await renderSignUp(callbacks());

    await fireEvent.changeText(screen.getByTestId("sign-up-nickname"), "Nova");

    expect(screen.getByText("4 / 16")).toBeOnTheScreen();
  });

  test("asks for the code after the form is sent (decision 0050 #2)", async () => {
    const handlers = callbacks();
    await renderSignUp(handlers);
    await fill("Seeker_7");

    await submit();

    expect(handlers.onCodeSent).toHaveBeenCalledWith("seeker@reckon.app", 60);
  });

  test("offers the optional news consent (decision 0050 #5)", async () => {
    await renderSignUp(callbacks());

    expect(screen.getByText("Хочу получать новости и подарки на e-mail")).toBeOnTheScreen();
  });
});
