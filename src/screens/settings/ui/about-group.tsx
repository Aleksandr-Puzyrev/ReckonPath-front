import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { SettingsRow } from "@shared/ui/settings-row";
import { Text } from "@shared/ui/text";

import CopyIcon from "@assets/icons/settings/copy.svg";
import PlayerIdIcon from "@assets/icons/settings/player-id.svg";
import VersionIcon from "@assets/icons/settings/version.svg";
import StarIcon from "@assets/icons/play/star.svg";

import SettingsGroup from "./settings-group";
import { styles } from "./settings-styles";

interface IAboutGroup {
  versionLabel: string;
  playerId: string | null;
  onCopyId: () => void;
  onRate: () => void;
}

const AboutGroup = ({ versionLabel, playerId, onCopyId, onRate }: IAboutGroup) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { colors } = theme;

  return (
    <SettingsGroup title={t("settings.group.about")}>
      <SettingsRow
        Icon={VersionIcon}
        iconColor={colors.rarity.common}
        label={t("settings.version")}
        isFirst
        accessory={
          <Text variant="button.s" style={styles.value}>
            {versionLabel}
          </Text>
        }
      />
      {playerId === null ? null : (
        <SettingsRow
          testID="settings-player-id"
          Icon={PlayerIdIcon}
          iconColor={colors.rarity.common}
          label={t("settings.playerId")}
          onPress={onCopyId}
          accessory={
            <View style={styles.valueRow}>
              <Text variant="button.s" style={styles.idText} numberOfLines={1}>
                {playerId}
              </Text>
              <CopyIcon
                width={theme.sizes.icon.s}
                height={theme.sizes.icon.s}
                color={colors.accent.cyan}
              />
            </View>
          }
        />
      )}
      <SettingsRow
        testID="settings-rate"
        Icon={StarIcon}
        iconColor={colors.currency.coin}
        label={t("settings.rate")}
        onPress={onRate}
      />
    </SettingsGroup>
  );
};

export default AboutGroup;
