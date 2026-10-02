import { Stack } from "expo-router";
import { useState } from "react";

import { SoftUpdateSheet } from "@screens/system";
import { isSoftUpdateSnoozed, useSystemNoticeStore, useSystemState } from "@entities/app-config";

import { useSystemSignalRefetch } from "../query/use-system-signal-refetch";
import { useGuestSession } from "../session/use-guest-session";
import { useAttemptsSync } from "../sync/use-attempts-sync";

const RootStack = () => {
  useSystemSignalRefetch();
  useGuestSession();
  useAttemptsSync();
  const { state } = useSystemState();
  const isMaintenanceDismissed = useSystemNoticeStore((notices) => notices.isMaintenanceDismissed);
  const softUpdateDismissedAt = useSystemNoticeStore((notices) => notices.softUpdateDismissedAt);
  const [launchedAt] = useState(Date.now);
  const isUpdateRequired = state.kind === "forcedUpdate";
  const isMaintenance = state.kind === "maintenance" && !isMaintenanceDismissed;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!isUpdateRequired && !isMaintenance}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="play/[mode]/[id]"
            options={{ presentation: "fullScreenModal", gestureEnabled: false }}
          />
        </Stack.Protected>
        <Stack.Protected guard={isUpdateRequired}>
          <Stack.Screen name="system/update" options={{ gestureEnabled: false }} />
        </Stack.Protected>
        <Stack.Protected guard={isMaintenance}>
          <Stack.Screen name="system/maintenance" options={{ gestureEnabled: false }} />
        </Stack.Protected>
      </Stack>
      {state.kind === "softUpdate" ? (
        <SoftUpdateSheet
          isOpen={!isSoftUpdateSnoozed(softUpdateDismissedAt, launchedAt)}
          version={state.version}
          storeUrl={state.storeUrl}
          message={state.message}
          onDismiss={useSystemNoticeStore.getState().dismissSoftUpdate}
        />
      ) : null}
    </>
  );
};

export default RootStack;
