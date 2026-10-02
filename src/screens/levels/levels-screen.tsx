import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUnistyles } from "react-native-unistyles";

import { CAMPAIGN_WORLDS } from "@entities/level";
import type { CampaignLevel } from "@entities/level";
import { campaignMaxStars, campaignStars, useProgressStore } from "@entities/progress";
import { Screen } from "@shared/ui/screen";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";
import { BoardPreview } from "@widgets/board";
import { LevelList, buildListItems } from "@widgets/level-list";
import type { LevelItem } from "@widgets/level-list";
import { LevelSheet } from "@widgets/level-sheet";

import LevelsHeader from "./levels-header";
import { styles } from "./levels-screen-styles";

const PREVIEW_SHARE = 0.36;

const LevelsScreen = () => {
  const { t } = useTranslation();
  const { rt } = useUnistyles();
  const best = useProgressStore((state) => state.best);
  const [sheetLevel, setSheetLevel] = useState<CampaignLevel | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const items = buildListItems(CAMPAIGN_WORLDS, best);
  const current = items.find((item) => item.type === "level" && item.state === "current");

  const play = ({ level }: CampaignLevel) => {
    setSheetLevel(null);
    router.push({ pathname: "/play/[mode]/[id]", params: { mode: "campaign", id: level.id } });
  };

  const handleLevelPress = (item: LevelItem) => {
    if (item.state === "current") {
      play(item.campaignLevel);
      return;
    }
    if (item.state === "done") {
      setSheetLevel(item.campaignLevel);
      return;
    }
    if (current?.type !== "level") return;
    setToast({
      id: Date.now(),
      text: t("levels.locked", { n: current.campaignLevel.number }),
    });
  };

  return (
    <Screen style={styles.screen}>
      <LevelList
        items={items}
        header={
          <LevelsHeader
            stars={campaignStars(CAMPAIGN_WORLDS, best)}
            maxStars={campaignMaxStars(CAMPAIGN_WORLDS)}
          />
        }
        onLevelPress={handleLevelPress}
      />
      <Toast message={toast} onHide={() => setToast(null)} />
      <LevelSheet
        campaignLevel={sheetLevel}
        preview={
          sheetLevel === null ? null : (
            <BoardPreview level={sheetLevel.level} size={rt.screen.width * PREVIEW_SHARE} />
          )
        }
        onPlay={play}
        onDismiss={() => setSheetLevel(null)}
      />
    </Screen>
  );
};

export default LevelsScreen;
