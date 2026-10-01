import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@shared/ui/button";

import { styles } from "./declined-bar-styles";

interface IDeclinedBar {
  onRestart: () => void;
  onExit: () => void;
}

const DeclinedBar = ({ onRestart, onExit }: IDeclinedBar) => {
  const { t } = useTranslation();

  return (
    <View style={styles.bar}>
      <View style={styles.cell}>
        <Button label={t("play.pause.restart")} onPress={onRestart} variant="primary" />
      </View>
      <View style={styles.cell}>
        <Button label={t("play.pause.exit")} onPress={onExit} />
      </View>
    </View>
  );
};

export default DeclinedBar;
