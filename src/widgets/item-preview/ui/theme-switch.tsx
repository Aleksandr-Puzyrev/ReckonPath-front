import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import MoonIcon from "@assets/icons/system/moon.svg";
import SunIcon from "@assets/icons/system/sun.svg";

import type { PreviewTheme } from "../model/preview-look";

import { styles } from "./theme-switch-styles";

interface IThemeSwitch {
  theme: PreviewTheme;
  onChange: (theme: PreviewTheme) => void;
}

const OPTIONS = [
  { theme: "light", Icon: SunIcon },
  { theme: "dark", Icon: MoonIcon },
] as const;

const ThemeSwitch = ({ theme, onChange }: IThemeSwitch) => {
  const { t } = useTranslation();
  const { theme: appTheme } = useUnistyles();
  const iconSize = appTheme.sizes.icon.m;

  return (
    <View style={styles.switch} accessibilityRole="radiogroup">
      {OPTIONS.map((option) => {
        const isSelected = option.theme === theme;
        return (
          <Pressable
            key={option.theme}
            accessibilityRole="radio"
            accessibilityLabel={t(`settings.theme.${option.theme}`)}
            accessibilityState={{ selected: isSelected }}
            onPress={() => onChange(option.theme)}
            style={[styles.option, isSelected ? styles.selected : null]}
          >
            <option.Icon
              width={iconSize}
              height={iconSize}
              color={isSelected ? appTheme.colors.text.primary : appTheme.colors.text.secondary}
            />
          </Pressable>
        );
      })}
    </View>
  );
};

export default ThemeSwitch;
