import { useEffect } from "react";

import { msLeft, useServerNow } from "@entities/match";
import { haptic } from "@shared/haptics";

import PlayerBar from "./player-bar";

interface ITimedPlayerBar {
  side: "me" | "opponent";
  nickname: string;
  status: string;
  deadline: string | undefined;
  totalMs: number;
}

const MS_PER_SECOND = 1000;
const TIMER_WARN_SECONDS = 2;

// The countdown lives here, so its ticks redraw the bar and not the board; a bar without a deadline is not on turn (отсчёт живёт здесь, поэтому его тики перерисовывают полосу, а не поле; полоса без дедлайна не ходит).
const TimedPlayerBar = ({ side, nickname, status, deadline, totalMs }: ITimedPlayerBar) => {
  const now = useServerNow();
  const left = msLeft(deadline, now);
  const seconds = Math.ceil(left / MS_PER_SECOND);
  const isWarning = deadline !== undefined && seconds > 0 && seconds <= TIMER_WARN_SECONDS;

  useEffect(() => {
    if (side === "me" && isWarning) haptic("light");
  }, [side, isWarning, seconds]);

  return (
    <PlayerBar
      side={side}
      nickname={nickname}
      status={status}
      timerShare={totalMs > 0 ? Math.min(1, left / totalMs) : 0}
      isWarning={isWarning}
    />
  );
};

export default TimedPlayerBar;
