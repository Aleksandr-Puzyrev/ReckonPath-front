import { useEffect, useState } from "react";

import { ws } from "@shared/ws";

const TICK_MS = 250;

// The timer follows the server deadline through the clock offset, not the phone clock (таймер идёт по серверному дедлайну с учётом смещения часов, а не по часам телефона).
export const useTurnCountdown = (deadline: number | null) => {
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (deadline === null) return undefined;
    const update = () => setLeft(Math.max(0, deadline - ws.serverNow()));
    update();
    const timer = setInterval(update, TICK_MS);
    return () => clearInterval(timer);
  }, [deadline]);

  return deadline === null ? 0 : left;
};
