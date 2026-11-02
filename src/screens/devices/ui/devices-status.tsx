import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import DevicesSkeleton from "./devices-skeleton";
import { styles } from "./devices-styles";

interface IDevicesStatus {
  isPending: boolean;
  isOnline: boolean;
  onRetry: () => void;
}

const DevicesStatus = ({ isPending, isOnline, onRetry }: IDevicesStatus) => {
  const { t } = useTranslation();

  if (!isOnline) {
    return (
      <Text variant="body.m" style={styles.message}>
        {t("common.offline")}
      </Text>
    );
  }
  if (isPending) return <DevicesSkeleton />;
  return (
    <View style={styles.error}>
      <Text variant="body.m" style={styles.message}>
        {t("errors.generic")}
      </Text>
      <Button testID="devices-retry" label={t("common.retry")} onPress={onRetry} />
    </View>
  );
};

export default DevicesStatus;
