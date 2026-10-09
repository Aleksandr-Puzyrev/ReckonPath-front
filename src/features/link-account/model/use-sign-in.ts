import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { revokeSession } from "@entities/session";
import { errorMessageKey, isApiError } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

import { loginMutationOptions } from "../api/login-mutation";
import type { LoginResult } from "../api/login-mutation";

import { hasGuestProgress, loadSavedAccount } from "./load-saved-account";
import type { SignInSchema } from "./sign-in-schema";

export interface SignInCallbacks {
  onSignedIn: () => void;
  onWrongCredentials: (messageKey: ErrorMessageKey) => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

export const useSignIn = ({ onSignedIn, onWrongCredentials, onError }: SignInCallbacks) => {
  const queryClient = useQueryClient();
  const [conflict, setConflict] = useState<LoginResult | null>(null);
  const unresolvedRef = useRef<LoginResult | null>(null);

  const load = useMutation({
    mutationFn: (session: LoginResult) => loadSavedAccount(queryClient, session),
    onSuccess: onSignedIn,
    onError: (error) => onError(errorMessageKey(error)),
  });

  const login = useMutation({
    ...loginMutationOptions(),
    onSuccess: (session) => {
      if (hasGuestProgress()) {
        unresolvedRef.current = session;
        setConflict(session);
        return;
      }
      load.mutate(session);
    },
    onError: (error) => {
      if (isApiError(error) && error.code === "INVALID_CREDENTIALS") {
        onWrongCredentials(errorMessageKey(error));
        return;
      }
      onError(errorMessageKey(error));
    },
  });

  // The guest stays whatever the answer: an unused session only waits to expire on the server (гость остаётся при любом ответе: неиспользованная сессия лишь дожидается истечения на сервере).
  // TODO: report a failed revoke to Sentry once it is set up
  const { mutate: revoke } = useMutation({ mutationFn: revokeSession });

  // Leaving the screen by a gesture is a cancel too, so the unused session is revoked (уход с экрана жестом — тоже отмена, и неиспользованная сессия отзывается).
  useEffect(
    () => () => {
      if (unresolvedRef.current !== null) revoke(unresolvedRef.current.refreshToken);
    },
    [revoke],
  );

  const handleLoadSaved = () => {
    if (conflict === null) return;
    unresolvedRef.current = null;
    load.mutate(conflict);
  };

  const handleCancelConflict = () => {
    if (conflict === null) return;
    unresolvedRef.current = null;
    revoke(conflict.refreshToken);
    setConflict(null);
  };

  return {
    submit: ({ login: name, password }: SignInSchema) => login.mutate({ login: name, password }),
    isPending: login.isPending || load.isPending,
    conflict,
    handleLoadSaved,
    handleCancelConflict,
  };
};
