import { useState } from "react";

import { useServerClock } from "@entities/app-config";
import { bannerChallengeOf, useChallengesQuery } from "@entities/challenge";
import { useAnswerChallenge } from "@features/answer-challenge";

const SECOND_MS = 1000;

interface ShownChallenge {
  id: string;
  at: number;
}

export const useChallengeBanner = (isHidden: boolean, onToast: (text: string) => void) => {
  const challenges = useChallengesQuery(!isHidden);
  const answer = useAnswerChallenge(onToast);
  const [answeredId, setAnsweredId] = useState<string | null>(null);
  const [shown, setShown] = useState<ShownChallenge | null>(null);
  const incoming = (challenges.data?.incoming ?? []).filter(({ id }) => id !== answeredId);
  const now = useServerClock(!isHidden && incoming.length > 0 ? SECOND_MS : null);
  const challenge = isHidden ? null : bannerChallengeOf(incoming, now);

  // The backend sends no creation time, so the bar drains from the moment the banner appears (бэкенд не присылает время создания, поэтому полоска убывает с момента появления плашки).
  if (challenge !== null && shown?.id !== challenge.id) setShown({ id: challenge.id, at: now });

  const startedAt = shown !== null && shown.id === challenge?.id ? shown.at : now;
  const expiresAt = challenge === null ? now : Date.parse(challenge.expiresAt);
  const totalMs = expiresAt - startedAt;

  // A challenge that may still be answered comes back after a failed answer (вызов, на который ещё можно ответить, возвращается после неудачного ответа).
  const restore = (isGone: boolean) => {
    if (!isGone) setAnsweredId(null);
  };

  return {
    challenge,
    share: totalMs > 0 ? Math.min(1, Math.max(0, expiresAt - now) / totalMs) : 0,
    isPending: answer.isPending,
    handleAccept: () => {
      if (challenge === null) return;
      setAnsweredId(challenge.id);
      answer.accept(challenge, restore);
    },
    handleDecline: () => {
      if (challenge === null) return;
      setAnsweredId(challenge.id);
      answer.decline(challenge, restore);
    },
  };
};
