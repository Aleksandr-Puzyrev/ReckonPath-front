import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { CAMPAIGN_LEVELS } from "@entities/level";
import { Button } from "@shared/ui/button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";

import { styles } from "./levels-screen-styles";

// TODO: replace the temporary test-level entry with the levels list (spec Part 4 §4, stage 1 task 2)
const LevelsScreen = () => {
  const { t } = useTranslation();

  return (
    <Screen style={styles.screen}>
      {CAMPAIGN_LEVELS.map(({ level, number }) => (
        <View key={level.id} style={styles.row}>
          <Text variant="title.m" style={styles.title}>
            {t("home.level", { n: number })}
          </Text>
          <Button
            testID={`play-${level.id}`}
            label={t("home.play")}
            variant="primary"
            onPress={() =>
              router.push({
                pathname: "/play/[mode]/[id]",
                params: { mode: "campaign", id: level.id },
              })
            }
          />
        </View>
      ))}
    </Screen>
  );
};

export default LevelsScreen;
