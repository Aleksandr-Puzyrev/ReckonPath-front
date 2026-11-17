import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { http, HttpResponse } from "msw/http";
import { Text } from "react-native";

import { useDailyLeaderboardQuery } from "@entities/daily";
import { useAccountStore } from "@entities/session";
import { i18n } from "@shared/i18n";
import { mockServer, mockUrl, setMockFriends } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import RedeemInviteForm from "./redeem-invite-form";

jest.mock("@gorhom/bottom-sheet", () =>
  jest.requireActual("@shared/ui/sheet/test-utils/bottom-sheet-mock"),
);

const HTTP_SERVER_ERROR = 500;

const FriendsTop = () => {
  const { data } = useDailyLeaderboardQuery("friends");
  return <Text testID="friends-top">{data?.entries.map(({ name }) => name).join(",")}</Text>;
};

const renderForm = async (onRedeemed: jest.Mock, onError: jest.Mock) => {
  useAccountStore.getState().markSignedIn();
  await render(
    <>
      <FriendsTop />
      <RedeemInviteForm isDisabled={false} onRedeemed={onRedeemed} onError={onError} />
    </>,
    { wrapper: createQueryWrapper() },
  );
};

const redeem = async (code: string) => {
  await fireEvent.changeText(screen.getByTestId("invite-redeem-input"), code);
  await act(async () => fireEvent.press(screen.getByTestId("invite-redeem")));
};

describe("RedeemInviteForm", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  afterEach(async () => {
    await cleanup();
    mockServer.reset();
    useAccountStore.getState().reset();
  });

  test("names the inviter and refreshes the friends top of the day (decision 0062 #12)", async () => {
    setMockFriends({ friends: {} });
    const onRedeemed = jest.fn();
    await renderForm(onRedeemed, jest.fn());
    await waitFor(() => expect(screen.getByTestId("friends-top")).toHaveTextContent(""));

    await redeem("NOVA2345");

    await waitFor(() => expect(onRedeemed).toHaveBeenCalledWith("Nova"));
    await waitFor(() => expect(screen.getByTestId("friends-top")).toHaveTextContent("Nova"));
  });

  test("reports an accepted code without a name when the re-read fails", async () => {
    mockServer.use(
      http.get(mockUrl("/friends"), () =>
        HttpResponse.json({ error: { code: "internal_error" } }, { status: HTTP_SERVER_ERROR }),
      ),
    );
    const onRedeemed = jest.fn();
    const onError = jest.fn();
    await renderForm(onRedeemed, onError);

    await redeem("GLEB2345");

    await waitFor(() => expect(screen.getByTestId("invite-redeem")).toBeDisabled());
    await waitFor(() => expect(screen.getByTestId("invite-redeem-input").props.value).toBe(""));
    expect(onError).not.toHaveBeenCalled();
    await waitFor(() => expect(onRedeemed).toHaveBeenCalledWith(null));
  });
});
