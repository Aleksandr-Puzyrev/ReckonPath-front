import { Platform } from "react-native";

import { loadAndroidNotifications, setUpAndroidDelivery } from "./android-push";
import { setUpIosDelivery, subscribeIosFcmToken } from "./ios-push";

export const setUpNativeDelivery = (
  label: string,
  shouldPrompt: boolean,
  isAllowed: () => boolean,
) =>
  Platform.OS === "ios"
    ? setUpIosDelivery(shouldPrompt, isAllowed)
    : setUpAndroidDelivery(label, shouldPrompt, isAllowed);

export const subscribeNativeFcmToken = (listener: (token: unknown) => void) => {
  if (Platform.OS === "ios") return subscribeIosFcmToken(listener);
  const subscription = loadAndroidNotifications().addPushTokenListener((token) => {
    if (token.type === "android") listener(token.data);
  });
  return () => subscription.remove();
};
