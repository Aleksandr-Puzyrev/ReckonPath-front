import { act, renderHook, waitFor } from "@testing-library/react-native";

import { watchGuestRewardedAd } from "@entities/ad";
import { useGameSessionStore } from "@entities/level";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import { useGuestAdContinueStore } from "./guest-ad-continue-store";
import { useContinueForAd } from "./use-continue-for-ad";

jest.mock("@entities/ad", () => ({
  ...jest.requireActual("@entities/ad"),
  watchGuestRewardedAd: jest.fn(async () => true),
}));

const continueGame = jest.fn();

const renderAd = async () => {
  const callbacks = { onContinued: jest.fn(), onMessage: jest.fn() };
  const hook = await renderHook(() => useContinueForAd(callbacks), {
    wrapper: createQueryWrapper(),
  });
  return { ...hook, callbacks };
};

describe("useContinueForAd for a guest (decision 0051 #3, #11)", () => {
  beforeEach(() => {
    useGameSessionStore.setState({ attemptId: "attempt-1", continueGame });
  });

  afterEach(() => {
    useGuestAdContinueStore.getState().reset();
    useGameSessionStore.getState().reset();
    continueGame.mockClear();
  });

  test("continues after the ad without the server and counts it on the device", async () => {
    const { result, callbacks } = await renderAd();

    await act(async () => result.current.handlePress());

    await waitFor(() => expect(callbacks.onContinued).toHaveBeenCalled());
    expect(watchGuestRewardedAd).toHaveBeenCalled();
    expect(continueGame).toHaveBeenCalledWith("ad");
    expect(result.current.left).toBe(1);
  });

  test("stops at two ad continues a day", async () => {
    const { result } = await renderAd();

    await act(async () => result.current.handlePress());
    await act(async () => result.current.handlePress());

    await waitFor(() => expect(result.current.state).toBe("limit"));
  });
});
