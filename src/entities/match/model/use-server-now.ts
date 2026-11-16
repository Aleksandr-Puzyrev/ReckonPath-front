import { useEffect, useState } from "react";

import { useMatchStore } from "./match-store";

const TICK_MS = 250;

// Timers follow the server's clock through the offset of the last answer, not the phone clock (таймеры идут по серверным часам со смещением последнего ответа, а не по часам телефона).
export const useServerNow = () => {
  const offsetMs = useMatchStore((state) => state.offsetMs);
  const [phoneNow, setPhoneNow] = useState(Date.now);

  useEffect(() => {
    const timer = setInterval(() => setPhoneNow(Date.now()), TICK_MS);
    return () => clearInterval(timer);
  }, []);

  return phoneNow + offsetMs;
};

export const msLeft = (deadline: string | undefined, now: number) =>
  deadline === undefined ? 0 : Math.max(0, Date.parse(deadline) - now);
