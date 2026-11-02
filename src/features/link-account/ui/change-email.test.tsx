import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { http } from "msw/http";

import {
  MOCK_CODE,
  MOCK_CURRENT_EMAIL,
  MOCK_TAKEN_EMAIL,
  MOCK_WRONG_PASSWORD,
} from "@shared/api/mocks/auth-handlers";
import { i18n } from "@shared/i18n";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import ChangeEmail from "./change-email";

const NEW_EMAIL = "nova@mail.ru";

const callbacks = () => ({ onBack: jest.fn(), onChanged: jest.fn(), onError: jest.fn() });

const sendCode = async (
  handlers: ReturnType<typeof callbacks>,
  email: string,
  password: string,
) => {
  await render(<ChangeEmail {...handlers} />, { wrapper: createQueryWrapper() });
  await fireEvent.changeText(screen.getByTestId("change-email"), email);
  await fireEvent.changeText(screen.getByTestId("change-email-password"), password);
  await act(async () => fireEvent.press(screen.getByTestId("change-email-send")));
};

const confirm = async (code: string) => {
  await fireEvent.changeText(screen.getByTestId("change-email-code"), code);
  await act(async () => fireEvent.press(screen.getByTestId("change-email-confirm")));
};

describe("ChangeEmail (decision 0053 #11)", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  afterEach(() => {
    mockServer.reset();
    jest.useRealTimers();
  });

  test("confirms the new address with the code", async () => {
    const handlers = callbacks();
    await sendCode(handlers, NEW_EMAIL, "Signal2026");
    expect(await screen.findByText(`Мы отправили код на ${NEW_EMAIL}`)).toBeOnTheScreen();

    await confirm(MOCK_CODE);

    expect(handlers.onChanged).toHaveBeenCalled();
  });

  test("shows a wrong code under the code field", async () => {
    const handlers = callbacks();
    await sendCode(handlers, NEW_EMAIL, "Signal2026");
    await screen.findByTestId("change-email-code");

    await confirm("000000");

    expect(await screen.findByText("Неверный код")).toBeOnTheScreen();
    expect(handlers.onChanged).not.toHaveBeenCalled();
  });

  test("sends the code again with the same address and password after the countdown", async () => {
    jest.useFakeTimers();
    const bodies: unknown[] = [];
    mockServer.use(
      http.post(mockUrl("/me/email"), async ({ request }) => {
        bodies.push(await request.clone().json());
        return undefined;
      }),
    );
    await sendCode(callbacks(), NEW_EMAIL, "Signal2026");
    expect(await screen.findByText("Отправить ещё раз через 1:00")).toBeOnTheScreen();
    expect(screen.getByTestId("change-email-resend")).toBeDisabled();

    await act(async () => jest.advanceTimersByTime(60_000));
    await act(async () => fireEvent.press(screen.getByTestId("change-email-resend")));

    expect(bodies).toEqual([
      { email: NEW_EMAIL, password: "Signal2026" },
      { email: NEW_EMAIL, password: "Signal2026" },
    ]);
    expect(await screen.findByText("Отправить ещё раз через 1:00")).toBeOnTheScreen();
  });

  test.each([
    [MOCK_TAKEN_EMAIL, "Signal2026", "Этот e-mail уже занят"],
    [MOCK_CURRENT_EMAIL, "Signal2026", "Это и так твой e-mail"],
    [NEW_EMAIL, MOCK_WRONG_PASSWORD, "Неверный пароль"],
  ])("explains %s / %s under its field", async (email, password, text) => {
    await sendCode(callbacks(), email, password);

    expect(await screen.findByText(text)).toBeOnTheScreen();
    expect(screen.queryByTestId("change-email-code")).toBeNull();
  });
});
