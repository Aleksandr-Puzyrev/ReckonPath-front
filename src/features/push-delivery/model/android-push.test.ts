import { http, HttpResponse } from "msw/http";

import { endSession, useAccountStore } from "@entities/session";
import { mockServer, mockUrl } from "@shared/test-utils/api-mock";

import { setUpAndroidDelivery } from "./android-push";

const mockGetPermission = jest.fn();
const mockAskPermission = jest.fn();
const mockDeviceToken = jest.fn();
const mockChannel = jest.fn();

jest.mock("expo-notifications", () => ({
  AndroidImportance: { DEFAULT: 3 },
  setNotificationChannelAsync: mockChannel,
  getPermissionsAsync: mockGetPermission,
  requestPermissionsAsync: mockAskPermission,
  getDevicePushTokenAsync: mockDeviceToken,
}));

jest.mock("@shared/config", () => ({
  ...jest.requireActual("@shared/config"),
  API_BASE_URL: "",
  HAS_FCM: true,
}));

const tokenPath = "/me/devices/current/push-tokens";
const token = "android-fixture-fcm-token";

afterEach(() => {
  jest.clearAllMocks();
  mockServer.reset();
  useAccountStore.getState().reset();
});

test("registers the Android token after permission is granted", async () => {
  mockGetPermission.mockResolvedValue({ granted: false, canAskAgain: true });
  mockAskPermission.mockResolvedValue({ granted: true });
  mockDeviceToken.mockResolvedValue({ type: "android", data: token });
  const capture = jest.fn();
  mockServer.use(
    http.put(mockUrl(tokenPath), async ({ request }) => {
      capture(await request.json(), request.headers.get("Idempotency-Key"));
      return new HttpResponse(null, { status: 204 });
    }),
  );

  await expect(setUpAndroidDelivery("Notifications", true, () => true)).resolves.toBe("registered");

  expect(mockChannel).toHaveBeenCalledWith("default", { name: "Notifications", importance: 3 });
  expect(capture).toHaveBeenCalledWith({ provider: "fcm", token }, expect.any(String));
});

test("removes the FCM token without requesting a permission when it was revoked", async () => {
  mockGetPermission.mockResolvedValue({ granted: false, canAskAgain: true });
  const capture = jest.fn();
  mockServer.use(
    http.delete(mockUrl(tokenPath + "/fcm"), () => {
      capture();
      return new HttpResponse(null, { status: 204 });
    }),
  );

  await expect(setUpAndroidDelivery("Notifications", false, () => true)).resolves.toBe(
    "permissionDenied",
  );

  expect(capture).toHaveBeenCalledTimes(1);
  expect(mockAskPermission).not.toHaveBeenCalled();
  expect(mockDeviceToken).not.toHaveBeenCalled();
});

test("clears tokens before signing out the current Android session", async () => {
  useAccountStore.getState().markSignedIn();
  const calls: string[] = [];
  mockServer.use(
    http.delete(mockUrl(tokenPath), () => {
      calls.push("tokens");
      return new HttpResponse(null, { status: 204 });
    }),
    http.post(mockUrl("/auth/logout"), () => {
      calls.push("logout");
      return new HttpResponse(null, { status: 204 });
    }),
  );

  await endSession();

  expect(calls).toEqual(["tokens", "logout"]);
  expect(useAccountStore.getState().hasLogin).toBe(false);
});
