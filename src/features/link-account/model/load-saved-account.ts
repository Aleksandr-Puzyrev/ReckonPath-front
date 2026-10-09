import type { QueryClient } from "@tanstack/react-query";

import { useDailyRecordStore } from "@entities/daily";
import { useGameSessionStore } from "@entities/level";
import { useOutboxStore } from "@entities/outbox";
import { useProgressStore } from "@entities/progress";
import { switchSession, useAccountStore } from "@entities/session";

import type { LoginResult } from "../api/login-mutation";

export const hasGuestProgress = () => Object.keys(useProgressStore.getState().best).length > 0;

// The guest's data is dropped before the switch, so the attempts sync loads the account's progress without merging the guest's (данные гостя удаляются до смены сессии, и синхронизация загружает прогресс аккаунта без слияния с гостевым).
export const loadSavedAccount = async (queryClient: QueryClient, session: LoginResult) => {
  useGameSessionStore.getState().reset();
  useOutboxStore.getState().reset();
  useProgressStore.getState().reset();
  useDailyRecordStore.getState().reset();
  await switchSession(session);
  useAccountStore.getState().markSignedIn();
  await queryClient.resetQueries();
};
