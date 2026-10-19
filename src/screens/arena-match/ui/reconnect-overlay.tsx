import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Text } from "@shared/ui/text";

import { styles } from "./arena-match-styles";

const SECOND_MS = 1000;

const ReconnectOverlay = () => {
  const { t } = useTranslation();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((current) => current + 1), SECOND_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.overlay} testID="match-reconnecting" accessibilityLiveRegion="polite">
      <Text variant="title.l">{t("match.reconnecting")}</Text>
      <Text variant="number.counter">{t("match.seconds", { sec: seconds })}</Text>
    </View>
  );
};

export default ReconnectOverlay;
