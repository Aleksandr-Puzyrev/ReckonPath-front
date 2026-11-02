import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { Device } from "@entities/device";
import { formatDateTime } from "@shared/lib";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { styles } from "./device-row-styles";

interface IDeviceRow {
  device: Device;
  isFirst: boolean;
  isDisabled: boolean;
  onRemove: (id: string) => void;
}

// A device without a model name is named by its platform, which is data and not translated (устройство без названия модели называется платформой — это данные, они не переводятся).
const PLATFORM_NAMES: Record<string, string> = { ios: "iOS", android: "Android", web: "Web" };
const NO_VERSION = "—";

const DeviceRow = ({ device, isFirst, isDisabled, onRemove }: IDeviceRow) => {
  const { t, i18n } = useTranslation();
  const name = device.name ?? PLATFORM_NAMES[device.platform] ?? device.platform;

  return (
    <View testID={`device-${device.id}`} style={[styles.row, isFirst ? null : styles.divided]}>
      <View style={styles.texts}>
        <Text variant="title.s">{name}</Text>
        <Text variant="body.s" style={styles.secondary}>
          {t("devices.details", {
            version: device.appVersion ?? NO_VERSION,
            date: formatDateTime(device.lastSeenAt, i18n.language),
          })}
        </Text>
      </View>
      {device.isCurrent ? (
        <Text variant="button.s" style={styles.current}>
          {t("devices.current")}
        </Text>
      ) : (
        <Button
          testID={`device-remove-${device.id}`}
          label={t("settings.account.signOut")}
          size="s"
          isDisabled={isDisabled}
          onPress={() => onRemove(device.id)}
        />
      )}
    </View>
  );
};

export default DeviceRow;
