import { useNavigation } from "expo-router";
import { usePreventRemove } from "expo-router/react-navigation";
import { useEffect, useEffectEvent } from "react";
import { BackHandler } from "react-native";

// Leaving the screen while waiting cancels the challenge first, then the navigation goes on (decision 0062 #20) (уход с экрана во время ожидания сначала отменяет вызов, затем навигация продолжается).
export const useWaitingExit = (isWaiting: boolean, onCancel: () => void) => {
  const navigation = useNavigation();

  usePreventRemove(isWaiting, ({ data }) => {
    onCancel();
    navigation.dispatch(data.action);
  });

  const handleBack = useEffectEvent(() => {
    if (navigation.canGoBack()) return false;
    onCancel();
    return true;
  });

  // Back on the first screen of the stack removes nothing, so it is caught here (назад на первом экране стека ничего не удаляет, поэтому ловится здесь).
  useEffect(() => {
    if (!isWaiting) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", handleBack);
    return () => subscription.remove();
  }, [isWaiting]);
};
