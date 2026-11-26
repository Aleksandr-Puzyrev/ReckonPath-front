import { http, HttpResponse } from "msw/http";

import { mockServer, mockUrl } from "@shared/test-utils/api-mock";

import { setUpIosDelivery, subscribeIosFcmToken } from "./ios-push";

const mockHasPermission = jest.fn();
const mockRequestPermission = jest.fn();
const mockIsRegistered = jest.fn();
const mockRegisterDevice = jest.fn();
const mockGetToken = jest.fn();
const mockOnTokenRefresh = jest.fn();

jest.mock("@react-native-firebase/messaging", () => ({
  AuthorizationStatus: {
    NOT_DETERMINED: -1,
    DENIED: 0,
    AUTHORIZED: 1,
    PROVISIONAL: 2,
    EPHEMERAL: 3,
  },
  getMessaging: () => "messaging",
  hasPermission: mockHasPermission,
  requestPermission: mockRequestPermission,
  isDeviceRegisteredForRemoteMessages: mockIsRegistered,
  registerDeviceForRemoteMessages: mockRegisterDevice,
  getToken: mockGetToken,
  onTokenRefresh: mockOnTokenRefresh,
}));

const path = "/me/devices/current/push-tokens";
const fcmToken = "ios-fixture-fcm-registration-token";

afterEach(() => {
  jest.resetAllMocks();
  mockServer.reset();
});

test("requests APNs registration before obtaining and uploading the FCM token", async () => {
  mockHasPermission.mockResolvedValue(-1);
  mockRequestPermission.mockResolvedValue(1);
  mockIsRegistered.mockReturnValue(false);
  mockRegisterDevice.mockResolvedValue(undefined);
  mockGetToken.mockResolvedValue(fcmToken);
  const capture = jest.fn();
  mockServer.use(
    http.put(mockUrl(path), async ({ request }) => {
      capture(await request.json());
      return new HttpResponse(null, { status: 204 });
    }),
  );

  await expect(setUpIosDelivery(true, () => true)).resolves.toBe("registered");
  expect(mockRequestPermission).toHaveBeenCalledWith("messaging");
  expect(mockRegisterDevice.mock.invocationCallOrder[0]).toBeLessThan(
    mockGetToken.mock.invocationCallOrder[0] ?? 0,
  );
  expect(capture).toHaveBeenCalledWith({ provider: "fcm", token: fcmToken });
});

test("clears the server token if the device no longer permits notifications", async () => {
  mockHasPermission.mockResolvedValue(0);
  const capture = jest.fn();
  mockServer.use(
    http.delete(mockUrl(`${path}/fcm`), () => {
      capture();
      return new HttpResponse(null, { status: 204 });
    }),
  );

  await expect(setUpIosDelivery(false, () => true)).resolves.toBe("permissionDenied");
  expect(capture).toHaveBeenCalledTimes(1);
  expect(mockRequestPermission).not.toHaveBeenCalled();
  expect(mockGetToken).not.toHaveBeenCalled();
});

test("does not upload a token if delivery is disabled during APNs registration", async () => {
  let allowed = true;
  mockHasPermission.mockResolvedValue(1);
  mockIsRegistered.mockReturnValue(false);
  mockRegisterDevice.mockImplementation(async () => {
    allowed = false;
  });

  await expect(setUpIosDelivery(false, () => allowed)).resolves.toBe("cancelled");
  expect(mockGetToken).not.toHaveBeenCalled();
});

test("forwards rotated tokens only while notification permission is granted", async () => {
  let rotate: ((token: string) => void) | undefined;
  const unsubscribe = jest.fn();
  mockOnTokenRefresh.mockImplementation((_messaging, listener: (token: string) => void) => {
    rotate = listener;
    return unsubscribe;
  });
  mockHasPermission.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
  const listener = jest.fn();
  const stop = subscribeIosFcmToken(listener);

  rotate?.(fcmToken);
  rotate?.("denied-fixture-fcm-token");
  await Promise.resolve();

  expect(listener).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledWith(fcmToken);
  stop();
  expect(unsubscribe).toHaveBeenCalledTimes(1);
});
