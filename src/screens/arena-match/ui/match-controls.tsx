import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@shared/ui/button";

import { styles } from "./arena-match-styles";

interface IMatchControls {
  isFlagMode: boolean;
  onFlag: () => void;
  onMenu: () => void;
}

const MatchControls = ({ isFlagMode, onFlag, onMenu }: IMatchControls) => {
  const { t } = useTranslation();

  return (
    <View style={styles.controls}>
      <View style={styles.control}>
        <Button
          testID="match-flag"
          label={t("match.flag")}
          variant={isFlagMode ? "primary" : "secondary"}
          size="m"
          onPress={onFlag}
        />
      </View>
      <View style={styles.control}>
        <Button
          testID="match-menu"
          label={t("match.menu")}
          variant="secondary"
          size="m"
          onPress={onMenu}
        />
      </View>
    </View>
  );
};

export default MatchControls;
