import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@shared/ui/button";
import { Sheet } from "@shared/ui/sheet";
import { StarRating } from "@shared/ui/star-rating";
import { Text } from "@shared/ui/text";

import { styles } from "./win-sheet-styles";

interface ITutorialWinSheet {
  isOpen: boolean;
  stars: number;
  onNext: () => void;
  onExit: () => void;
}

const TutorialWinSheet = ({ isOpen, stars, onNext, onExit }: ITutorialWinSheet) => {
  const { t } = useTranslation();

  return (
    <Sheet isOpen={isOpen} onDismiss={onExit} isDismissible={false}>
      <View style={styles.stars}>
        <StarRating
          stars={stars}
          size="l"
          accessibilityLabel={t("result.stars", { count: stars })}
        />
      </View>
      <Text variant="display.l" style={styles.center}>
        {t("play.found")}
      </Text>
      <Text variant="body.m" style={styles.moves}>
        {t("onboarding.resultNote")}
      </Text>
      <Button label={t("result.win.next")} onPress={onNext} variant="primary" size="l" />
    </Sheet>
  );
};

export default TutorialWinSheet;
