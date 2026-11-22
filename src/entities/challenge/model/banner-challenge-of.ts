import type { Challenge } from "./challenge-types";

const expiryOf = ({ expiresAt }: Challenge) => Date.parse(expiresAt);

// The backend sends no creation time, and every challenge waits as long, so the newest one expires last (бэкенд не присылает время создания, а все вызовы ждут одинаково, поэтому самый новый истекает последним).
export const bannerChallengeOf = (incoming: readonly Challenge[], now: number) =>
  incoming
    .filter((challenge) => challenge.status === "pending" && expiryOf(challenge) > now)
    .reduce<Challenge | null>(
      (newest, challenge) =>
        newest === null || expiryOf(challenge) > expiryOf(newest) ? challenge : newest,
      null,
    );
