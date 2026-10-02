import { router } from "expo-router";
import { useEffect } from "react";

import { TUTORIAL } from "@reckon-path/content";

import { useRulesStore } from "@entities/rules";
import { Screen } from "@shared/ui/screen";

// TODO: compose the screen from its widgets (spec Part 4) — empty until its task
const HomeScreen = () => {
  // A new player starts with the level 1 tutorial (новый игрок начинает с обучения на уровне 1).
  useEffect(() => {
    if (useRulesStore.getState().tutorial !== "pending") return;
    router.replace({
      pathname: "/play/[mode]/[id]",
      params: { mode: "campaign", id: TUTORIAL.levelId },
    });
  }, []);

  return <Screen />;
};

export default HomeScreen;
