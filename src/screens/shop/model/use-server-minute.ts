import { useEffect, useState } from "react";

import { useClockOffset } from "@entities/app-config";

const MINUTE_MS = 60_000;

export const useServerMinute = () => {
  const offset = useClockOffset();
  const [phoneNow, setPhoneNow] = useState(Date.now);

  useEffect(() => {
    const timer = setInterval(() => setPhoneNow(Date.now()), MINUTE_MS);
    return () => clearInterval(timer);
  }, []);

  return phoneNow + offset;
};
