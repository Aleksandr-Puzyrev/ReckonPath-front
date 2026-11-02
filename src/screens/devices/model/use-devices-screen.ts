import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useSignOut } from "@features/sign-out";
import { deviceKeys, removeDeviceMutationOptions, useDevicesQuery } from "@entities/device";
import { errorMessageKey, useIsOnline } from "@shared/api";

export const useDevicesScreen = (onToast: (text: string) => void) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const devices = useDevicesQuery();
  const isOnline = useIsOnline();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const remove = useMutation({
    ...removeDeviceMutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: deviceKeys.all });
      onToast(t("devices.signedOut"));
    },
    onError: (error) => onToast(t(errorMessageKey(error))),
  });

  const signOut = useSignOut({
    isEverywhere: true,
    onSignedOut: () =>
      router.navigate({
        pathname: "/settings",
        params: { changed: "devices", at: String(Date.now()) },
      }),
    onError: (messageKey) => onToast(t(messageKey)),
  });

  return {
    devices: devices.data,
    isPending: devices.isPending,
    isOnline,
    isBusy: remove.isPending || signOut.isPending,
    isConfirmOpen,
    handleRetry: () => void devices.refetch(),
    handleRemove: (id: string) => remove.mutate(id),
    handleSignOutAll: () => setIsConfirmOpen(true),
    handleConfirm: () => {
      setIsConfirmOpen(false);
      signOut.signOut();
    },
    handleCancel: () => setIsConfirmOpen(false),
  };
};
