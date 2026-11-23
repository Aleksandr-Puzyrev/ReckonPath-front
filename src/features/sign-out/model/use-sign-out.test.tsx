import { act, cleanup, renderHook, waitFor } from "@testing-library/react-native";

import { emptyDraft, useLevelEditorStore, useTryoutBestStore } from "@entities/custom-level";
import { useAccountStore } from "@entities/session";
import { mockServer } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import { useSignOut } from "./use-sign-out";

describe("useSignOut", () => {
  afterEach(async () => {
    await cleanup();
    mockServer.reset();
    useAccountStore.getState().reset();
    useLevelEditorStore.getState().reset();
    useTryoutBestStore.getState().reset();
  });

  test("clears the level editor draft and the tryout bests (decision 0063 #12)", async () => {
    useAccountStore.getState().markSignedIn();
    useLevelEditorStore.getState().open("new", emptyDraft("Бухта", 5, 5, "distance"), null);
    useTryoutBestStore.getState().record("RP2-a", 7);
    const onSignedOut = jest.fn();
    const { result } = await renderHook(() => useSignOut({ onSignedOut, onError: jest.fn() }), {
      wrapper: createQueryWrapper(),
    });

    await act(async () => result.current.signOut());

    await waitFor(() => expect(onSignedOut).toHaveBeenCalled());
    expect(useLevelEditorStore.getState().session).toBeNull();
    expect(useTryoutBestStore.getState().best).toEqual({});
  });
});
