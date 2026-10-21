import { useTranslation } from "react-i18next";
import { useUnistyles } from "react-native-unistyles";

import { useSettingsStore } from "@entities/settings";
import { resolveLanguage } from "@shared/i18n";
import type { AppLanguage } from "@shared/i18n";
import { Segmented } from "@shared/ui/segmented";
import { SettingsRow } from "@shared/ui/settings-row";
import type { ThemeChoice } from "@shared/theme";

import LanguageIcon from "@assets/icons/settings/language.svg";
import MoonIcon from "@assets/icons/system/moon.svg";

import SettingsGroup from "./settings-group";

interface ILookGroup {
  onLanguage: (language: AppLanguage) => void;
}

const THEMES: readonly ThemeChoice[] = ["light", "dark", "system"];
const LANGUAGES: readonly AppLanguage[] = ["ru", "en"];

const LookGroup = ({ onLanguage }: ILookGroup) => {
  const { t, i18n } = useTranslation();
  const { theme } = useUnistyles();
  const themeChoice = useSettingsStore((state) => state.theme);

  return (
    <SettingsGroup title={t("settings.group.look")}>
      <SettingsRow
        Icon={MoonIcon}
        iconColor={theme.colors.accent.blue}
        label={t("settings.theme.title")}
        isFirst
      >
        <Segmented
          testID="settings-theme"
          options={THEMES.map((value) => ({ value, label: t(`settings.theme.${value}`) }))}
          value={themeChoice}
          onChange={useSettingsStore.getState().setTheme}
        />
      </SettingsRow>
      <SettingsRow
        Icon={LanguageIcon}
        iconColor={theme.colors.accent.cyan}
        label={t("settings.language.title")}
      >
        <Segmented
          testID="settings-language"
          options={LANGUAGES.map((value) => ({ value, label: t(`settings.language.${value}`) }))}
          value={resolveLanguage(i18n.language)}
          onChange={onLanguage}
        />
      </SettingsRow>
    </SettingsGroup>
  );
};

export default LookGroup;
