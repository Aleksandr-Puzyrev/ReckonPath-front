import { useIsMutating } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { PushControls } from "@features/push-delivery";
import {
  deviceNotificationTimeZone,
  updateDeviceNotificationKey,
  useDeviceNotificationSettings,
  useUpdateDeviceNotifications,
} from "@entities/notification";
import type { NotificationChannel } from "@entities/notification";
import { errorMessageKey, useIsOnline } from "@shared/api";
import { HAS_FCM } from "@shared/config";
import { resolveLanguage } from "@shared/i18n";
import { Button } from "@shared/ui/button";
import { SettingsRow } from "@shared/ui/settings-row";
import { Text } from "@shared/ui/text";
import { Toggle } from "@shared/ui/toggle";

import ArenaIcon from "@assets/icons/tabs/arena.svg";
import FriendsIcon from "@assets/icons/settings/account.svg";
import DailyIcon from "@assets/icons/tabs/play.svg";
import EventsIcon from "@assets/icons/tabs/shop.svg";

import SettingsGroup from "./settings-group";
import { styles } from "./settings-styles";

const CHANNELS = [
  { channel: "daily", Icon: DailyIcon },
  { channel: "friends", Icon: FriendsIcon },
  { channel: "arena", Icon: ArenaIcon },
  { channel: "events", Icon: EventsIcon },
] as const satisfies readonly { channel: NotificationChannel; Icon: typeof DailyIcon }[];

const DeviceNotificationGroup = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useUnistyles();
  const query = useDeviceNotificationSettings();
  const { mutate, error } = useUpdateDeviceNotifications();
  const online = useIsOnline();
  const busy = useIsMutating({ mutationKey: updateDeviceNotificationKey }) > 0;
  const current = query.data;

  const update = (channel: NotificationChannel) =>
    mutate({
      channel,
      locale: resolveLanguage(i18n.language),
      tz: deviceNotificationTimeZone(),
    });

  return (
    <SettingsGroup title={t("deviceNotifications.title")}>
      {HAS_FCM && <PushControls />}
      {!online && (
        <Text variant="body.s" style={styles.historyCard}>
          {t("deviceNotifications.offline")}
        </Text>
      )}
      {query.isLoading && <ActivityIndicator accessibilityLabel={t("competition.loading")} />}
      {query.isError && (
        <View style={styles.historyCard}>
          <Text variant="body.s">{t(errorMessageKey(query.error))}</Text>
          <Button
            label={t("common.retry")}
            isDisabled={!online}
            onPress={() => void query.refetch()}
          />
        </View>
      )}
      {current !== undefined &&
        CHANNELS.map(({ channel, Icon }, index) => {
          const label = t(`deviceNotifications.channels.${channel}`);
          return (
            <SettingsRow
              key={channel}
              label={label}
              Icon={Icon}
              iconColor={theme.colors.accent.cyan}
              isFirst={index === 0}
              accessory={
                <Toggle
                  testID={`device-notification-${channel}`}
                  label={label}
                  isOn={current.channels.includes(channel)}
                  isDisabled={!online || busy}
                  onToggle={() => update(channel)}
                />
              }
            />
          );
        })}
      {error !== null && (
        <Text variant="body.s" style={styles.historyCard} accessibilityLiveRegion="polite">
          {t(errorMessageKey(error))}
        </Text>
      )}
    </SettingsGroup>
  );
};

export default DeviceNotificationGroup;
