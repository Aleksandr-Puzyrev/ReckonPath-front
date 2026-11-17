import { useTranslation } from "react-i18next";

import { dayResultOf, useDailyQuery } from "@entities/daily";
import { useDailyToday } from "@features/daily-today";
import { Screen } from "@shared/ui/screen";

import { exitDaily } from "../model/exit-daily";
import { useDailyLoader } from "../model/use-daily-loader";

import DailyPlay from "./daily-play";
import DayOver from "./day-over";
import LevelUnavailable from "./level-unavailable";
import { styles } from "./play-screen-styles";

const DailyLevel = () => {
  const { t } = useTranslation();
  const { todayKey } = useDailyToday();
  const { load, restart, retry } = useDailyLoader();
  const { data: daily } = useDailyQuery();

  if (load.kind === "loading") return <Screen style={styles.screen} testID="daily-loading" />;
  if (load.kind === "unavailable") {
    return <LevelUnavailable message={t("daily.unavailable")} onExit={exitDaily} />;
  }
  if (load.kind === "offline") {
    return <LevelUnavailable message={t("daily.network")} onExit={exitDaily} onRetry={retry} />;
  }
  if (load.kind === "failed") {
    return <LevelUnavailable message={t(load.messageKey)} onExit={exitDaily} onRetry={retry} />;
  }
  const { game } = load;
  // A game of a past day cannot be finished, only its win can still be looked at (партию прошедшего дня не доиграть, можно только посмотреть её победу).
  if (game.date !== todayKey && game.status !== "won") return <DayOver todayKey={todayKey} />;
  const day = daily?.day.date === game.date ? daily.day : undefined;
  return (
    <DailyPlay
      key={game.id}
      game={game}
      place={dayResultOf(day)?.place ?? null}
      onRestart={restart}
    />
  );
};

export default DailyLevel;
