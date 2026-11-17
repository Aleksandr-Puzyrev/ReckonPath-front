import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { styles } from "./daily-message-styles";

interface IDailyMessage {
  message: string;
  onRetry?: () => void;
}

const DailyMessage = ({ message, onRetry }: IDailyMessage) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container} testID="daily-message">
      <Text variant="title.l" style={styles.text}>
        {message}
      </Text>
      {onRetry === undefined ? null : (
        <Button label={t("common.retry")} onPress={onRetry} variant="primary" />
      )}
    </View>
  );
};

export default DailyMessage;
