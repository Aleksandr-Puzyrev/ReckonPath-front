import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Text } from "@shared/ui/text";

import CheckIcon from "@assets/icons/levels/check.svg";

import { styles } from "./hide-owned-chip-styles";

interface IHideOwnedChip {
  isOn: boolean;
  onToggle: () => void;
}

const HideOwnedChip = ({ isOn, onToggle }: IHideOwnedChip) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  styles.useVariants({ isOn });
  const iconSize = theme.sizes.icon.s;

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isOn }}
      onPress={onToggle}
      style={styles.chip}
    >
      <View style={styles.box}>
        {isOn ? (
          <CheckIcon width={iconSize} height={iconSize} color={theme.colors.text.inverse} />
        ) : null}
      </View>
      <Text variant="caption" style={styles.label}>
        {t("shop.hideOwned")}
      </Text>
    </Pressable>
  );
};

export default HideOwnedChip;
