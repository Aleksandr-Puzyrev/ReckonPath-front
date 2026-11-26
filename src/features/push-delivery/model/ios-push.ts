import type * as FirebaseMessaging from "@react-native-firebase/messaging";

import { clearCurrentFcmToken, registerCurrentFcmToken } from "@shared/api";

import { isFcmToken } from "./push-token";

const loadIosMessaging = (): typeof FirebaseMessaging => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("@react-native-firebase/messaging") as typeof FirebaseMessaging;
};

const isAuthorized = (status: number, { AuthorizationStatus }: typeof FirebaseMessaging) =>
  status === AuthorizationStatus.AUTHORIZED ||
  status === AuthorizationStatus.PROVISIONAL ||
  status === AuthorizationStatus.EPHEMERAL;

let registeringForApns: Promise<void> | undefined;

const registerForApns = (
  sdk: typeof FirebaseMessaging,
  messaging: ReturnType<typeof sdk.getMessaging>,
) => {
  if (registeringForApns !== undefined) return registeringForApns;
  if (sdk.isDeviceRegisteredForRemoteMessages(messaging)) return Promise.resolve();
  registeringForApns = sdk.registerDeviceForRemoteMessages(messaging).finally(() => {
    registeringForApns = undefined;
  });
  return registeringForApns;
};

export const setUpIosDelivery = async (shouldPrompt: boolean, isAllowed: () => boolean) => {
  const sdk = loadIosMessaging();
  const messaging = sdk.getMessaging();
  const existing = await sdk.hasPermission(messaging);
  const permission =
    shouldPrompt && existing === sdk.AuthorizationStatus.NOT_DETERMINED
      ? await sdk.requestPermission(messaging)
      : existing;

  if (!isAuthorized(permission, sdk)) {
    await clearCurrentFcmToken(isAllowed);
    return "permissionDenied" as const;
  }
  if (!isAllowed()) return "cancelled" as const;

  await registerForApns(sdk, messaging);
  if (!isAllowed()) return "cancelled" as const;

  const token = await sdk.getToken(messaging);
  if (!isFcmToken(token)) throw new Error("Invalid iOS FCM token");
  return (await registerCurrentFcmToken(token, isAllowed))
    ? ("registered" as const)
    : ("cancelled" as const);
};

export const subscribeIosFcmToken = (listener: (token: string) => void) => {
  const sdk = loadIosMessaging();
  const messaging = sdk.getMessaging();
  return sdk.onTokenRefresh(messaging, (token) => {
    void sdk
      .hasPermission(messaging)
      .then((status) => {
        if (isAuthorized(status, sdk)) listener(token);
      })
      .catch(() => undefined);
  });
};
