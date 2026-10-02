import { useEffect, useEffectEvent } from "react";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";

import { Text } from "../text";

import { styles } from "./toast-styles";

export interface ToastMessage {
  id: number;
  text: string;
}

interface IToast {
  message: ToastMessage | null;
  onHide: () => void;
}

const Toast = ({ message, onHide }: IToast) => {
  const { theme } = useUnistyles();
  const hide = useEffectEvent(onHide);

  useEffect(() => {
    if (message === null) return;
    const timer = setTimeout(hide, theme.motion.toast.duration);
    return () => clearTimeout(timer);
  }, [message, theme.motion.toast.duration]);

  if (message === null) return null;

  return (
    <Animated.View
      key={message.id}
      entering={FadeInDown.duration(theme.motion.duration.base)}
      exiting={FadeOut.duration(theme.motion.duration.fast)}
      style={styles.toast}
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <Text variant="body.s" style={styles.text} numberOfLines={2}>
        {message.text}
      </Text>
    </Animated.View>
  );
};

export default Toast;
