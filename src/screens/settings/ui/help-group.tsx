import { useTranslation } from "react-i18next";
import { useUnistyles } from "react-native-unistyles";

import { SettingsRow } from "@shared/ui/settings-row";

import RulesIcon from "@assets/icons/settings/rules.svg";
import SupportIcon from "@assets/icons/settings/support.svg";

import SettingsGroup from "./settings-group";

interface IHelpGroup {
  onRules: () => void;
  onSupport: () => void;
}

const HelpGroup = ({ onRules, onSupport }: IHelpGroup) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <SettingsGroup title={t("settings.group.help")}>
      <SettingsRow
        testID="settings-rules"
        Icon={RulesIcon}
        iconColor={theme.colors.accent.cyan}
        label={t("settings.rules")}
        isFirst
        onPress={onRules}
      />
      <SettingsRow
        testID="settings-support"
        Icon={SupportIcon}
        iconColor={theme.colors.status.success}
        label={t("settings.support")}
        onPress={onSupport}
      />
    </SettingsGroup>
  );
};

export default HelpGroup;
