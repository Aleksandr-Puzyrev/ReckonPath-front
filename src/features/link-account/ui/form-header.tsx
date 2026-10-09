import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { IconButton } from "@shared/ui/icon-button";
import { ScreenTitle } from "@shared/ui/screen-title";

import ChevronLeftIcon from "@assets/icons/levels/chevron-left.svg";

import { styles } from "./form-header-styles";

interface IFormHeader {
  eyebrow: string;
  title: string;
  onBack: () => void;
}

const FormHeader = ({ eyebrow, title, onBack }: IFormHeader) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const iconSize = theme.sizes.iconButton.icon;

  return (
    <View style={styles.header}>
      <IconButton
        icon={
          <ChevronLeftIcon width={iconSize} height={iconSize} color={theme.colors.text.primary} />
        }
        accessibilityLabel={t("common.back")}
        onPress={onBack}
      />
      <ScreenTitle eyebrow={eyebrow} title={title} />
    </View>
  );
};

export default FormHeader;
