import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useMatchStore, useTurnCountdown } from "@entities/match";
import type { Side } from "@entities/match";
import { haptic } from "@shared/haptics";

import PlayerBar from "./player-bar";

interface ITimedPlayerBar {
  side: Side;
  nickname: string;
  status: string;
  isOffline: boolean;
  bubble: string | null;
}

const MS_PER_SECOND = 1000;
// The server deadline adds 300 ms for the network to the turn time (Part 7 §8.4) (серверный дедлайн добавляет к ходу 300 мс на сеть).
const NETWORK_ALLOWANCE_MS = 300;
const TIMER_WARN_SECONDS = 2;

// The countdown lives here, so its ticks redraw the bar and not the board (отсчёт живёт здесь, поэтому его тики перерисовывают полосу, а не поле).
const TimedPlayerBar = ({ side, nickname, status, isOffline, bubble }: ITimedPlayerBar) => {
  const { deadline, current, turnSec } = useMatchStore(
    useShallow((state) => ({
      deadline: state.deadline,
      current: state.current,
      turnSec: state.format?.turnSec ?? 0,
    })),
  );
  const isActive = current === side;
  const left = useTurnCountdown(isActive ? deadline : null);
  const turnMs = turnSec * MS_PER_SECOND + NETWORK_ALLOWANCE_MS;
  const seconds = Math.ceil(left / MS_PER_SECOND);
  const isWarning = isActive && seconds > 0 && seconds <= TIMER_WARN_SECONDS;

  useEffect(() => {
    if (side === "me" && isWarning) haptic("light");
  }, [side, isWarning, seconds]);

  return (
    <PlayerBar
      side={side}
      nickname={nickname}
      status={status}
      timerShare={isActive && turnMs > 0 ? left / turnMs : 0}
      isWarning={isWarning}
      isOffline={isOffline}
      bubble={bubble}
    />
  );
};

export default TimedPlayerBar;
