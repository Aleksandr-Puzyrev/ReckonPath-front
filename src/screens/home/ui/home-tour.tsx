import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { CoachMark } from "@shared/ui/coach-mark";

import { styles } from "./home-tour-styles";

interface IHomeTour {
  onDone: () => void;
}

const STEPS = 2;

// The first card points at the hero under the top bar, the second at the «Уровни» tab above the tab bar (первая карточка указывает на геро под верхней панелью, вторая — на вкладку «Уровни» над таб-баром).
const HomeTour = ({ onDone }: IHomeTour) => {
  const { t } = useTranslation();
  const [isLevelsStep, setIsLevelsStep] = useState(false);
  const caption = t("home.tour.step", { n: isLevelsStep ? STEPS : 1, total: STEPS });

  return (
    <View style={styles.overlay} testID="home-tour" accessibilityViewIsModal>
      <View style={isLevelsStep ? styles.tabs : styles.hero}>
        {isLevelsStep ? (
          <CoachMark
            text={t("home.tour.levels")}
            caption={caption}
            action={{ label: t("home.tour.gotIt"), onPress: onDone }}
          />
        ) : (
          <CoachMark
            text={t("home.tour.current")}
            caption={caption}
            action={{ label: t("home.tour.next"), onPress: () => setIsLevelsStep(true) }}
          />
        )}
      </View>
    </View>
  );
};

export default HomeTour;
