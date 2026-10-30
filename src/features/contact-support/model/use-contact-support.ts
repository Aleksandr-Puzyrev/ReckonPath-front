import { useMutation } from "@tanstack/react-query";
import * as Device from "expo-device";
import { Platform } from "react-native";

import { useAccountStore } from "@entities/session";
import { createTicketMutationOptions } from "@entities/support";
import { useMeQuery } from "@entities/wallet";
import { errorMessageKey } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";
import { APP_VERSION } from "@shared/config";

export type SupportTopic = "ban_appeal" | "support";

interface SupportCallbacks {
  onSent: () => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

const deviceOf = () =>
  [Platform.OS, Device.osVersion, Device.modelName].filter((part) => part !== null).join(" ");

export const useContactSupport = (topic: SupportTopic, { onSent, onError }: SupportCallbacks) => {
  const { data: me } = useMeQuery();
  const hasLogin = useAccountStore((state) => state.hasLogin);
  const { mutate, isPending } = useMutation({
    ...createTicketMutationOptions(),
    onSuccess: onSent,
    onError: (error) => onError(errorMessageKey(error)),
  });

  return {
    isPending,
    submit: (message: string) =>
      mutate({
        topic,
        message,
        diagnostics: {
          appVersion: APP_VERSION,
          device: deviceOf(),
          ...(hasLogin && me !== undefined ? { userId: me.id } : {}),
        },
      }),
  };
};
