import { router } from "expo-router";
import { useTranslation } from "react-i18next";

import { dailyLevelId } from "@entities/daily";

import { exitDaily } from "../model/exit-daily";

import LevelUnavailable from "./level-unavailable";

interface IDayOver {
  todayKey: string;
}

const DayOver = ({ todayKey }: IDayOver) => {
  const { t } = useTranslation();

  return (
    <LevelUnavailable
      message={t("daily.dayOver")}
      onExit={exitDaily}
      retryLabel={t("home.play")}
      onRetry={() =>
        router.replace({
          pathname: "/play/[mode]/[id]",
          params: { mode: "daily", id: dailyLevelId(todayKey) },
        })
      }
    />
  );
};

export default DayOver;
