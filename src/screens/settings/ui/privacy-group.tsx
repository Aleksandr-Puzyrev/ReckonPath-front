import { useTranslation } from "react-i18next";
import { useUnistyles } from "react-native-unistyles";

import { openPrivacyPolicy } from "@shared/api";
import { SettingsRow } from "@shared/ui/settings-row";

import PolicyIcon from "@assets/icons/settings/policy.svg";

import SettingsGroup from "./settings-group";

const PrivacyGroup = () => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <SettingsGroup title={t("settings.group.privacy")}>
      <SettingsRow
        testID="settings-privacy-policy"
        Icon={PolicyIcon}
        iconColor={theme.colors.rarity.common}
        label={t("settings.privacyPolicy")}
        isFirst
        onPress={openPrivacyPolicy}
      />
    </SettingsGroup>
  );
};

export default PrivacyGroup;
