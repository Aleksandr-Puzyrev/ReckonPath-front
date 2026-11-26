import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useSystemState } from "@entities/app-config";
import { RESUME_PARAM, useCampaignQuery } from "@entities/level";
import { dailyUnlockOf, useDailyToday } from "@features/daily-today";
import { isPackCurrent, useOfflineCampaign } from "@entities/offline-campaign";
import { useIsOnline } from "@shared/api";
import { HAS_BACKEND } from "@shared/config";
import { Screen } from "@shared/ui/screen";

import { resolveDailyRoute } from "../model/resolve-play-level";

import CampaignLevel from "./campaign-level";
import DailyLevel from "./daily-level";
import DayOver from "./day-over";
import LevelUnavailable from "./level-unavailable";
import OfflineCampaignLevel from "./offline-campaign-level";
import { styles } from "./play-screen-styles";

const CAMPAIGN_MODE = "campaign";
const DAILY_MODE = "daily";
const LEVEL_NUMBER = /^[1-9]\d*$/;
const LEVELS_ROUTE = "/levels";

const exit = () => {
  if (router.canGoBack()) router.back();
  else router.replace(LEVELS_ROUTE);
};

interface IPlayMode {
  mode: string;
  id: string;
  isResuming: boolean;
}

const PlayMode = ({ mode, id, isResuming }: IPlayMode) => {
  const { t } = useTranslation();
  const { data: overview, isLoading } = useCampaignQuery();
  const { todayKey } = useDailyToday();
  const online = useIsOnline();
  const { state: system } = useSystemState();
  const maintenance = system.kind === "maintenance";
  const [isOfflineCampaign] = useState(() => {
    const pack = useOfflineCampaign.getState().pack;
    return (
      mode === "offline" ||
      (HAS_BACKEND &&
        mode === CAMPAIGN_MODE &&
        (!online || maintenance) &&
        pack !== null &&
        isPackCurrent(pack))
    );
  });
  if (isOfflineCampaign && LEVEL_NUMBER.test(id))
    return <OfflineCampaignLevel number={Number(id)} />;

  if (mode === CAMPAIGN_MODE && LEVEL_NUMBER.test(id)) {
    return <CampaignLevel number={Number(id)} isResuming={isResuming} />;
  }
  if (mode !== DAILY_MODE) return <LevelUnavailable message={t("play.notFound")} onExit={exit} />;
  // The daily opens by the server's unlock, so it waits for the first answer (дейли открывается по разрешению сервера, поэтому ждёт его первого ответа).
  if (isLoading) return <Screen style={styles.screen} />;
  const unlock = dailyUnlockOf(overview);
  const route = resolveDailyRoute(id, { isUnlocked: unlock.isUnlocked, todayKey });
  if (route.kind === "missing") {
    return <LevelUnavailable message={t("play.notFound")} onExit={exit} />;
  }
  if (route.kind === "dailyLocked") {
    return (
      <LevelUnavailable message={t("daily.locked", { n: unlock.unlockLevel })} onExit={exit} />
    );
  }
  if (route.kind === "dayOver") return <DayOver todayKey={todayKey} />;
  return <DailyLevel />;
};

// A new level gets fresh screen state even when the route is reused (новый уровень получает свежее состояние экрана, даже если маршрут переиспользуется).
const PlayScreen = () => {
  const {
    mode = "",
    id = "",
    resume,
  } = useLocalSearchParams<{ mode: string; id: string; resume?: string }>();
  return (
    <PlayMode key={`${mode}/${id}`} mode={mode} id={id} isResuming={resume === RESUME_PARAM} />
  );
};

export default PlayScreen;
