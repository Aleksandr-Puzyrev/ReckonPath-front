import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { uuidv7 } from "uuidv7";

import { createTicketMutationOptions, supportTicketKeys } from "@entities/support";
import type { SupportTopic } from "@entities/support";
import { useMeQuery } from "@entities/wallet";
import { errorMessageKey } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";
import { APP_VERSION } from "@shared/config";

import { SUPPORT_TEXTS } from "./support-texts";
import type { SupportSentKey } from "./support-texts";

export interface SupportCallbacks {
  onSent: (messageKey: SupportSentKey) => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

const APP_VERSION_MAX = 40;
const DEVICE_MAX = 120;

const deviceOf = () =>
  [Platform.OS, Device.osVersion, Device.modelName].filter((part) => part !== null).join(" ");

export const useContactSupport = (topic: SupportTopic, { onSent, onError }: SupportCallbacks) => {
  const client = useQueryClient();
  const { data: me } = useMeQuery();
  const { mutate, isPending } = useMutation({
    ...createTicketMutationOptions(),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: supportTicketKeys.all });
      onSent(SUPPORT_TEXTS[topic].sent);
    },
    onError: (error) => onError(errorMessageKey(error)),
  });

  return {
    isPending,
    submit: (message: string) =>
      mutate({
        ticket: {
          topic,
          message,
          diagnostics: {
            appVersion: APP_VERSION.slice(0, APP_VERSION_MAX),
            device: deviceOf().slice(0, DEVICE_MAX),
            ...(me === undefined ? {} : { userId: me.id }),
          },
        },
        idempotencyKey: uuidv7(),
      }),
  };
};
