import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { styles } from "./retry-bar-styles";

interface IRetryBar {
  isPending: boolean;
  onRetry: () => void;
}

const RetryBar = ({ isPending, onRetry }: IRetryBar) => {
  const { t } = useTranslation();

  return (
    <View style={styles.bar} testID="retry-bar" accessibilityLiveRegion="polite">
      <Text variant="body.s" style={styles.text}>
        {t("errors.NETWORK")}
      </Text>
      <Button label={t("common.retry")} onPress={onRetry} isDisabled={isPending} />
    </View>
  );
};

export default RetryBar;
