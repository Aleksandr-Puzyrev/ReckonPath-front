import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";

import { RESUME_PARAM, useCampaignQuery } from "@entities/level";
import { dailyUnlockOf } from "@features/daily-today";
import { Screen } from "@shared/ui/screen";

import CampaignLevel from "./campaign-level";
import DailyPlay from "./daily-play";
import LevelUnavailable from "./level-unavailable";
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

  if (mode === CAMPAIGN_MODE && LEVEL_NUMBER.test(id)) {
    return <CampaignLevel number={Number(id)} isResuming={isResuming} />;
  }
  if (mode !== DAILY_MODE) return <LevelUnavailable message={t("play.notFound")} onExit={exit} />;
  // The daily opens by the server's unlock, so it waits for the first answer (дейли открывается по разрешению сервера, поэтому ждёт его первого ответа).
  if (isLoading) return <Screen style={styles.screen} />;
  const unlock = dailyUnlockOf(overview);
  return <DailyPlay id={id} isUnlocked={unlock.isUnlocked} unlockLevel={unlock.unlockLevel} />;
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
