import { router } from "expo-router";
import { useEffect } from "react";

import { TUTORIAL } from "@reckon-path/content";

import { useRulesStore } from "@entities/rules";
import { Screen } from "@shared/ui/screen";
import { DailyCard } from "@widgets/daily-card";

import { styles } from "./home-screen-styles";

// TODO: compose the rest of the screen from its widgets (spec Part 4) — only the daily card for now
const HomeScreen = () => {
  // A new player starts with the level 1 tutorial (новый игрок начинает с обучения на уровне 1).
  useEffect(() => {
    if (useRulesStore.getState().tutorial !== "pending") return;
    router.replace({
      pathname: "/play/[mode]/[id]",
      params: { mode: "campaign", id: TUTORIAL.levelId },
    });
  }, []);

  return (
    <Screen style={styles.screen}>
      <DailyCard onOpen={() => router.push("/daily")} />
    </Screen>
  );
};

export default HomeScreen;
