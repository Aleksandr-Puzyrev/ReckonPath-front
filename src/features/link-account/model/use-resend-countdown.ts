import { useEffect, useState } from "react";

const SECOND_MS = 1000;

export const useResendCountdown = (initialSeconds: number) => {
  const [resendAt, setResendAt] = useState(() => Date.now() + initialSeconds * SECOND_MS);
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), SECOND_MS);
    return () => clearInterval(timer);
  }, []);

  return {
    resendInMs: Math.max(0, resendAt - now),
    restart: (seconds: number) => setResendAt(Date.now() + seconds * SECOND_MS),
  };
};
