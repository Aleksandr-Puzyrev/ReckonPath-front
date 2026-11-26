import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { useSystemState } from "@entities/app-config";
import {
  campaignLevelId,
  levelOfPublicBoard,
  useCampaignLevelQuery,
  useCampaignQuery,
} from "@entities/level";
import type { CampaignLevel, CampaignWorld } from "@entities/level";
import { useIsOnline } from "@shared/api";
import { HAS_BACKEND } from "@shared/config";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";
import { BoardPreview } from "@widgets/board";
import { EarnSheet } from "@widgets/earn-sheet";
import { LevelList, buildListItems } from "@widgets/level-list";
import type { LevelItem } from "@widgets/level-list";
import { LevelSheet } from "@widgets/level-sheet";
import { TopBar } from "@widgets/top-bar";

import LevelsHeader from "./levels-header";
import { styles } from "./levels-screen-styles";
import OfflineCampaignPanel from "./offline-campaign-panel";

const PREVIEW_SHARE = 0.36;

interface SheetLevel {
  level: CampaignLevel;
  world: CampaignWorld;
}

const worldOf = (worlds: readonly CampaignWorld[], number: number) =>
  worlds.find(({ levels }) => levels.some((level) => level.number === number));

const LevelsScreen = () => {
  const { t } = useTranslation();
  const { rt } = useUnistyles();
  const isOnline = useIsOnline();
  const { state: system } = useSystemState();
  const { data: overview, isError } = useCampaignQuery();
  const [sheet, setSheet] = useState<SheetLevel | null>(null);
  const { data: detail } = useCampaignLevelQuery(sheet?.level.number ?? null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isEarnOpen, setIsEarnOpen] = useState(false);
  const worlds = overview?.worlds ?? [];
  const items = buildListItems(worlds);
  const isUnavailable = overview === undefined && (isError || !isOnline);

  const play = ({ number }: CampaignLevel) => {
    setSheet(null);
    router.push({
      pathname: "/play/[mode]/[id]",
      params: { mode: "campaign", id: String(number) },
    });
  };

  const handleLevelPress = ({ level, state }: LevelItem) => {
    if (state === "current") {
      play(level);
      return;
    }
    const world = worldOf(worlds, level.number);
    if (state === "done" && world !== undefined) {
      setSheet({ level, world });
      return;
    }
    if (overview === undefined) return;
    setToast({ id: Date.now(), text: t("levels.locked", { n: overview.currentLevel }) });
  };

  return (
    <Screen style={styles.screen}>
      <View style={styles.top}>
        <TopBar onWalletPress={() => setIsEarnOpen(true)} />
      </View>
      <LevelList
        items={items}
        header={
          <>
            <LevelsHeader
              stars={overview?.stars ?? 0}
              maxStars={overview?.starsMax ?? 0}
              onEditor={() => router.push("/editor")}
              onPlayCode={() => router.push("/play")}
            />
            {HAS_BACKEND && (
              <OfflineCampaignPanel isOffline={!isOnline || system.kind === "maintenance"} />
            )}
            {isUnavailable && !HAS_BACKEND ? (
              <Text variant="body.s" style={styles.offline} testID="campaign-offline">
                {t("campaign.offline")}
              </Text>
            ) : null}
          </>
        }
        onLevelPress={handleLevelPress}
      />
      <Toast message={toast} onHide={() => setToast(null)} />
      <LevelSheet
        sheet={sheet}
        board={detail?.board ?? null}
        preview={
          sheet === null || detail === undefined ? null : (
            <BoardPreview
              level={levelOfPublicBoard(detail.board, campaignLevelId(detail.number))}
              size={rt.screen.width * PREVIEW_SHARE}
            />
          )
        }
        onPlay={play}
        onDismiss={() => setSheet(null)}
      />
      <EarnSheet
        isOpen={isEarnOpen}
        shortBy={null}
        onDaily={() => {
          setIsEarnOpen(false);
          router.push("/daily");
        }}
        onMessage={(messageKey) => setToast({ id: Date.now(), text: t(messageKey) })}
        onClose={() => setIsEarnOpen(false)}
      />
    </Screen>
  );
};

export default LevelsScreen;
