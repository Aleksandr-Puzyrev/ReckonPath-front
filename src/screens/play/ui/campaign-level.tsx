import { router } from "expo-router";
import { useTranslation } from "react-i18next";

import { Screen } from "@shared/ui/screen";

import { useCampaignLoader } from "../model/use-campaign-loader";

import CampaignPlay from "./campaign-play";
import LevelUnavailable from "./level-unavailable";
import { styles } from "./play-screen-styles";

interface ICampaignLevel {
  number: number;
  isResuming: boolean;
}

const LEVELS_ROUTE = "/levels";

const exit = () => {
  if (router.canGoBack()) router.back();
  else router.replace(LEVELS_ROUTE);
};

const CampaignLevel = ({ number, isResuming }: ICampaignLevel) => {
  const { t } = useTranslation();
  const { load, restart, retry } = useCampaignLoader(number);

  if (load.kind === "loading") return <Screen style={styles.screen} testID="campaign-loading" />;
  if (load.kind === "missing")
    return <LevelUnavailable message={t("play.notFound")} onExit={exit} />;
  if (load.kind === "locked") {
    return <LevelUnavailable message={t("levels.locked", { n: load.lockedBy })} onExit={exit} />;
  }
  if (load.kind === "offline") {
    return <LevelUnavailable message={t("campaign.offline")} onExit={exit} onRetry={retry} />;
  }
  if (load.kind === "failed") {
    return <LevelUnavailable message={t(load.messageKey)} onExit={exit} onRetry={retry} />;
  }
  return (
    <CampaignPlay
      key={load.game.id}
      level={load.detail}
      game={load.game}
      isResuming={isResuming}
      onRestart={restart}
    />
  );
};

export default CampaignLevel;
