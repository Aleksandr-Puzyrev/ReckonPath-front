import { useState } from "react";
import { useTranslation } from "react-i18next";

import { HAS_BACKEND } from "@shared/config";
import { DailyCalendar } from "@widgets/daily-calendar";
import { DailyTodayCard } from "@widgets/daily-today-card";
import { DayLeaderboard } from "@widgets/day-leaderboard";
import { StreakCard } from "@widgets/streak-card";

import type { useDailyScreen } from "../model/use-daily-screen";

import DailyHistoryResult from "./daily-history-result";
import DailyMessage from "./daily-message";
import DailyStreakNotice from "./daily-streak-notice";

interface IDailyBody {
  daily: ReturnType<typeof useDailyScreen>;
}

const DailyBody = ({ daily }: IDailyBody) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { t } = useTranslation();
  const { state, day, rewards, leaderboard } = daily;

  if (state.kind === "loading") return null;
  if (state.kind === "unavailable") return <DailyMessage message={t("daily.unavailable")} />;
  if (state.kind === "offline") {
    return <DailyMessage message={t("daily.network")} onRetry={daily.handleRetry} />;
  }
  if (state.kind === "failed") {
    return <DailyMessage message={t(state.messageKey)} onRetry={daily.handleRetry} />;
  }
  if (day === undefined || rewards === undefined) return null;
  return (
    <>
      <DailyStreakNotice
        offer={daily.restoreOffer}
        restoredDays={daily.restoredDays}
        {...daily.restoreCallbacks}
      />
      <DailyTodayCard day={day} rewards={rewards} onPlay={daily.handlePlay} />
      {daily.hasLogin ? <StreakCard streak={daily.streak} /> : null}
      <DailyCalendar
        todayKey={daily.todayKey}
        wonDays={daily.wonDays}
        {...(HAS_BACKEND && daily.hasLogin ? { onOpenDay: setSelectedDate } : {})}
      />
      {selectedDate !== null && (
        <DailyHistoryResult date={selectedDate} onClose={() => setSelectedDate(null)} />
      )}
      {daily.hasLogin && leaderboard !== undefined ? (
        <DayLeaderboard
          entries={leaderboard.entries}
          mine={leaderboard.mine ?? null}
          hasWon={daily.hasWon}
          scope={daily.scope}
          hasFriends={daily.hasFriends}
          isOnline={daily.isOnline}
          onScopeChange={daily.handleScopeChange}
          onAddFriends={daily.handleAddFriends}
          onOpenProfile={daily.handleOpenProfile}
        />
      ) : null}
    </>
  );
};

export default DailyBody;
