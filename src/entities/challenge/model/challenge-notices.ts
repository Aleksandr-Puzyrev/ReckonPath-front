import { arenaSocket } from "@shared/ws";

import type { ChallengeNotice } from "./challenge-types";

export const onChallengeNotice = (listener: (notice: ChallengeNotice) => void) =>
  arenaSocket.onEvent(({ type, challenge }) => {
    if (type === "challenge" && challenge !== undefined) listener(challenge);
  });
