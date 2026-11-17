import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import type { ReactNode } from "react";
import { Share } from "react-native";

import { useAccountStore } from "@entities/session";
import { i18n } from "@shared/i18n";
import { MOCK_INVITE_CODE, mockServer, mockUrl, setMockFriends } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import AddFriendSheet from "./add-friend-sheet";

const mockClipboard = { setStringAsync: jest.fn(async (_text: string) => true) };

jest.mock("expo-clipboard", () => ({
  setStringAsync: (text: string) => mockClipboard.setStringAsync(text),
}));
jest.mock("@gorhom/bottom-sheet", () =>
  jest.requireActual("@shared/ui/sheet/test-utils/bottom-sheet-mock"),
);
jest.mock("@shared/ui/sheet", () => ({
  Sheet: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? children : null,
}));

const FRIENDS_LIMIT = 200;
const HTTP_SERVER_ERROR = 500;
const DEBOUNCE_MS = 300;
const onToast = jest.fn();

const renderSheet = async () => {
  useAccountStore.getState().markSignedIn();
  await render(<AddFriendSheet isOpen isOnline onToast={onToast} onClose={jest.fn()} />, {
    wrapper: createQueryWrapper(),
  });
  await screen.findByText(MOCK_INVITE_CODE);
};

const search = async (text: string) => {
  await fireEvent.changeText(screen.getByTestId("friend-search"), text);
};

const redeem = async (code: string) => {
  await fireEvent.changeText(screen.getByTestId("invite-redeem-input"), code);
  await act(async () => fireEvent.press(screen.getByTestId("invite-redeem")));
};

describe("AddFriendSheet (design 24.2, decision 0062)", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  afterEach(async () => {
    await cleanup();
    mockServer.reset();
    useAccountStore.getState().reset();
    onToast.mockClear();
    mockClipboard.setStringAsync.mockClear();
  });

  test("asks for three characters before searching (decision 0062 #11)", async () => {
    await renderSheet();

    await search("Ki");

    expect(screen.getByText("Введите хотя бы 3 символа ника")).toBeOnTheScreen();
  });

  test("searches only after typing pauses", async () => {
    jest.useFakeTimers();
    const searched: string[] = [];
    mockServer.use(
      http.get(mockUrl("/friends/search"), ({ request }) => {
        searched.push(new URL(request.url).searchParams.get("nickname") ?? "");
      }),
    );
    await renderSheet();

    await search("Mir");
    await act(() => jest.advanceTimersByTimeAsync(DEBOUNCE_MS / 2));
    await search("Miro");
    await act(() => jest.advanceTimersByTimeAsync(DEBOUNCE_MS));

    expect(await screen.findByTestId("found-player-7")).toBeOnTheScreen();
    expect(searched).toEqual(["Miro"]);
    jest.useRealTimers();
  });

  test("tells when the search fails", async () => {
    mockServer.use(
      http.get(mockUrl("/friends/search"), () =>
        HttpResponse.json({ error: { code: "internal_error" } }, { status: HTTP_SERVER_ERROR }),
      ),
    );
    await renderSheet();

    await search("Mir");

    expect(await screen.findByTestId("friend-search-error")).toHaveTextContent(
      "Что-то пошло не так. Попробуй ещё раз",
    );
  });

  test("tells when no one is found", async () => {
    await renderSheet();

    await search("Zzz");

    expect(await screen.findByText("Никого не нашли")).toBeOnTheScreen();
  });

  test("finds players by the nickname start with the action by relation (FRN-02)", async () => {
    await renderSheet();

    await search("Mil");

    expect(await screen.findByTestId("found-action-mock-5")).toHaveTextContent("В друзьях");
    expect(screen.getByTestId("found-action-player-6")).toHaveTextContent("Отправлено ✓");
    expect(screen.getByTestId("found-action-player-6")).toBeDisabled();
  });

  test("sends a request and marks it sent (decision 0062 #11)", async () => {
    await renderSheet();
    await search("Mir");

    const add = await screen.findByTestId("found-action-player-7");
    expect(add).toHaveTextContent("Добавить");
    await act(async () => fireEvent.press(add));

    await waitFor(() =>
      expect(screen.getByTestId("found-action-player-7")).toHaveTextContent("Отправлено ✓"),
    );
  });

  test("becomes friends at once with a player who has already asked (FRN-03)", async () => {
    await renderSheet();
    await search("Tim");

    const accept = await screen.findByTestId("found-action-player-4");
    expect(accept).toHaveTextContent("Принять");
    await act(async () => fireEvent.press(accept));

    await waitFor(() => expect(onToast).toHaveBeenCalledWith("Timur теперь в друзьях"));
  });

  test("reports the friend limit (FRN-04)", async () => {
    const friends = Object.fromEntries(
      Array.from({ length: FRIENDS_LIMIT }, (_, index) => [`friend-${index}`, "offline" as const]),
    );
    setMockFriends({ friends });
    await renderSheet();
    await search("Tim");

    const accept = await screen.findByTestId("found-action-player-4");
    await act(async () => fireEvent.press(accept));

    await waitFor(() => expect(onToast).toHaveBeenCalledWith("Достигнут лимит друзей (200)"));
  });

  test("copies my code", async () => {
    await renderSheet();

    await act(async () => fireEvent.press(screen.getByTestId("invite-copy")));

    expect(mockClipboard.setStringAsync).toHaveBeenCalledWith(MOCK_INVITE_CODE);
    expect(screen.getByTestId("invite-copy")).toHaveTextContent("Скопировано ✓");
    expect(screen.getByText("Друг сыграет первый матч на арене — тебе ◆ 20")).toBeOnTheScreen();
  });

  test("shares my code as text (decision 0062 #3)", async () => {
    const share = jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction" });
    await renderSheet();

    await fireEvent.press(screen.getByTestId("invite-share"));

    expect(share).toHaveBeenCalledWith({ message: MOCK_INVITE_CODE });
    share.mockRestore();
  });

  test("redeems a friend's code and names the new friend (decision 0062 #2)", async () => {
    await renderSheet();

    await redeem("gleb2345");

    await waitFor(() => expect(onToast).toHaveBeenCalledWith("Код принят — Gleb теперь в друзьях"));
    await waitFor(() => expect(screen.queryByTestId("invite-redeem-input")).toBeNull());
  });

  test("tells when the code can no longer be entered", async () => {
    setMockFriends({ isInviteExpired: true });
    await renderSheet();

    await redeem("GLEB2345");

    await waitFor(() =>
      expect(onToast).toHaveBeenCalledWith("Код можно ввести только в первые 7 дней"),
    );
  });
});
