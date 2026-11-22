import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import { invalidateChallenges } from "@entities/challenge";
import type { Challenge } from "@entities/challenge";
import { matchSession, useMatchStore } from "@entities/match";
import { errorMessageKey, errorMessageValues, isApiError } from "@shared/api";

import {
  acceptChallengeMutationOptions,
  declineChallengeMutationOptions,
} from "../api/answer-challenge-mutations";

// Tells the caller whether the challenge is gone for good or may still be answered (сообщает, исчез ли вызов совсем или на него ещё можно ответить).
type OnFailed = (isGone: boolean) => void;

const isGoneError = (error: unknown) => isApiError(error) && error.code === "challenge_not_found";

// The accepted match goes to the match store; the app-wide arena host opens it like the pushed one (принятый матч попадает в хранилище матча; общий хост арены открывает его так же, как присланный).
export const useAnswerChallenge = (onToast: (text: string) => void) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isAnsweringRef = useRef(false);
  const settle = () => {
    isAnsweringRef.current = false;
    void invalidateChallenges(queryClient);
  };
  const showError = (error: unknown) =>
    onToast(t(errorMessageKey(error, "arena"), errorMessageValues(error)));

  const accept = useMutation({
    ...acceptChallengeMutationOptions(),
    onSuccess: (match) => useMatchStore.getState().receive(match),
    onSettled: settle,
  });

  const decline = useMutation({
    ...declineChallengeMutationOptions(),
    onSettled: settle,
  });

  const begin = () => {
    if (isAnsweringRef.current) return false;
    isAnsweringRef.current = true;
    return true;
  };

  return {
    isPending: accept.isPending || decline.isPending,
    accept: (challenge: Challenge, onFailed: OnFailed) => {
      if (!begin()) return;
      accept.mutate(challenge.id, {
        onError: (error) => {
          const runningId = isApiError(error) ? error.details.id : undefined;
          if (
            isApiError(error) &&
            error.code === "match_in_progress" &&
            typeof runningId === "string"
          ) {
            onFailed(true);
            void matchSession.refresh();
            router.push({ pathname: "/arena/match/[id]", params: { id: runningId } });
            return;
          }
          onFailed(isGoneError(error));
          showError(error);
        },
      });
    },
    decline: (challenge: Challenge, onFailed: OnFailed) => {
      if (!begin()) return;
      decline.mutate(challenge.id, {
        onSuccess: () => onToast(t("friends.challenge.declined", { name: challenge.from.name })),
        onError: (error) => {
          onFailed(isGoneError(error));
          showError(error);
        },
      });
    },
  };
};
