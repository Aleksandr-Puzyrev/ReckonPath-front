import { router } from "expo-router";
import { useEffect, useState } from "react";

import { TUTORIAL } from "@reckon-path/content";

import { useRulesStore } from "@entities/rules";
import { Screen } from "@shared/ui/screen";
import { DailyCard } from "@widgets/daily-card";
import { EarnSheet } from "@widgets/earn-sheet";
import { TopBar } from "@widgets/top-bar";

import { styles } from "./home-screen-styles";

// TODO: compose the rest of the screen from its widgets (spec Part 4) — only the daily card for now
const HomeScreen = () => {
  const [isEarnOpen, setIsEarnOpen] = useState(false);

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
      <TopBar onWalletPress={() => setIsEarnOpen(true)} />
      <DailyCard onOpen={() => router.push("/daily")} />
      <EarnSheet
        isOpen={isEarnOpen}
        shortBy={null}
        onDaily={() => {
          setIsEarnOpen(false);
          router.push("/daily");
        }}
        onClose={() => setIsEarnOpen(false)}
      />
    </Screen>
  );
};

export default HomeScreen;
