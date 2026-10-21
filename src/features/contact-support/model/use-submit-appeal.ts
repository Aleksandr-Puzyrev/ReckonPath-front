import { useMutation } from "@tanstack/react-query";
import * as Device from "expo-device";
import { Platform } from "react-native";

import { createTicketMutationOptions } from "@entities/support";
import { useMeQuery } from "@entities/wallet";
import { errorMessageKey } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";
import { APP_VERSION } from "@shared/config";

const APPEAL_TOPIC = "ban_appeal";

interface AppealCallbacks {
  onSent: () => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

const deviceOf = () =>
  [Platform.OS, Device.osVersion, Device.modelName].filter((part) => part !== null).join(" ");

export const useSubmitAppeal = ({ onSent, onError }: AppealCallbacks) => {
  const { data: me } = useMeQuery();
  const { mutate, isPending } = useMutation({
    ...createTicketMutationOptions(),
    onSuccess: onSent,
    onError: (error) => onError(errorMessageKey(error)),
  });

  return {
    isPending,
    submit: (message: string) =>
      mutate({
        topic: APPEAL_TOPIC,
        message,
        diagnostics: { appVersion: APP_VERSION, device: deviceOf(), userId: me?.id ?? "" },
      }),
  };
};
