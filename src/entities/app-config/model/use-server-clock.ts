import { useEffect, useState } from "react";

import { useClockOffset } from "../api/bootstrap-queries";

// Countdowns follow the server's clock through the offset of the last answer, not the phone clock; without a tick the clock stands still (отсчёты идут по серверным часам со смещением последнего ответа, а не по часам телефона; без шага часы стоят).
export const useServerClock = (tickMs: number | null) => {
  const offset = useClockOffset();
  const [phoneNow, setPhoneNow] = useState(Date.now);

  useEffect(() => {
    if (tickMs === null) return;
    const timer = setInterval(() => setPhoneNow(Date.now()), tickMs);
    return () => clearInterval(timer);
  }, [tickMs]);

  return phoneNow + offset;
};
