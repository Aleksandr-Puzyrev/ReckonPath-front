import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { CoachMark } from "@shared/ui/coach-mark";

import MineIcon from "@assets/icons/play/mine.svg";

import { styles } from "./bomb-coach-styles";

interface IBombCoach {
  onClose: () => void;
}

const BombCoach = ({ onClose }: IBombCoach) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const iconSize = theme.sizes.bombCoach.icon;

  return (
    <CoachMark
      icon={
        <View style={styles.tile}>
          <View style={styles.tint} />
          <MineIcon width={iconSize} height={iconSize} color={theme.colors.status.danger} />
        </View>
      }
      title={t("rules.title.bombNear")}
      text={t("rules.bombNear")}
      action={{ label: t("rules.gotIt"), onPress: onClose }}
    />
  );
};

export default BombCoach;
