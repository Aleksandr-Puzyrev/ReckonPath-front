import { Stack } from "expo-router";
import { useEffect, useState } from "react";

import { SoftUpdateSheet } from "@screens/system";
import { useInterstitialStore } from "@entities/ad";
import { isSoftUpdateSnoozed, useSystemNoticeStore, useSystemState } from "@entities/app-config";

import LinkOfferHost from "../account/link-offer-host";
import AdsConsentHost from "../ads/ads-consent-host";
import { useSystemSignalRefetch } from "../query/use-system-signal-refetch";
import { useGuestSession } from "../session/use-guest-session";
import { useAttemptsSync } from "../sync/use-attempts-sync";
import { useDailyWeekPrefetch } from "../sync/use-daily-week-prefetch";

const RootStack = () => {
  useSystemSignalRefetch();
  useGuestSession();
  useAttemptsSync();
  useDailyWeekPrefetch();
  const { state } = useSystemState();
  const isMaintenanceDismissed = useSystemNoticeStore((notices) => notices.isMaintenanceDismissed);
  const softUpdateDismissedAt = useSystemNoticeStore((notices) => notices.softUpdateDismissedAt);
  const [launchedAt] = useState(Date.now);

  // The first launch starts the quiet first session of interstitials (первый запуск начинает тихую первую сессию без межстраничной рекламы).
  useEffect(() => {
    useInterstitialStore.getState().markLaunched(launchedAt);
  }, [launchedAt]);
  const isUpdateRequired = state.kind === "forcedUpdate";
  const isMaintenance = state.kind === "maintenance" && !isMaintenanceDismissed;
  const isSoftUpdateOpen =
    state.kind === "softUpdate" && !isSoftUpdateSnoozed(softUpdateDismissedAt, launchedAt);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!isUpdateRequired && !isMaintenance}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="daily" />
          <Stack.Screen name="arena/history/[id]" />
          <Stack.Screen name="arena/map/[id]" options={{ gestureEnabled: false }} />
          <Stack.Screen
            name="arena/search"
            options={{ presentation: "fullScreenModal", gestureEnabled: false }}
          />
          <Stack.Screen
            name="arena/match/[id]"
            options={{ presentation: "fullScreenModal", gestureEnabled: false }}
          />
          <Stack.Screen
            name="play/[mode]/[id]"
            options={{ presentation: "fullScreenModal", gestureEnabled: false }}
          />
          <Stack.Screen name="account/sign-in" options={{ presentation: "modal" }} />
          <Stack.Screen name="account/sign-up" options={{ presentation: "modal" }} />
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
          isOpen={isSoftUpdateOpen}
          version={state.version}
          storeUrl={state.storeUrl}
          message={state.message}
          onDismiss={useSystemNoticeStore.getState().dismissSoftUpdate}
        />
      ) : null}
      <LinkOfferHost isSuspended={isSoftUpdateOpen} />
      <AdsConsentHost />
    </>
  );
};

export default RootStack;
