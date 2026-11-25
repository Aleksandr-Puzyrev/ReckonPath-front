import { Stack } from "expo-router";
import { useEffect, useState } from "react";

import { SoftUpdateSheet } from "@screens/system";
import { useLocaleSync } from "@features/change-language";
import { useIsConsentRequired } from "@features/manage-consents";
import { useInterstitialStore } from "@entities/ad";
import {
  isSoftUpdateSnoozed,
  useBanStore,
  useSystemNoticeStore,
  useSystemState,
} from "@entities/app-config";
import { useAccountStore } from "@entities/session";
import { useSettingsStore } from "@entities/settings";
import { isSystemLanguageSupported } from "@shared/i18n";

import LinkOfferHost from "../account/link-offer-host";
import ArenaSocketHost from "../arena/arena-socket-host";
import ChallengeBannerHost from "../arena/challenge-banner-host";
import AdsConsentHost from "../ads/ads-consent-host";
import { useSystemSignalRefetch } from "../query/use-system-signal-refetch";
import "../session/register-api-session";
import { useGuestCacheCleanup } from "../session/use-guest-cache-cleanup";
import SplashGate from "../splash/splash-gate";
import { removeRetiredStores } from "../storage/remove-retired-stores";

const RootStack = () => {
  useSystemSignalRefetch();
  useGuestCacheCleanup();
  useLocaleSync();
  const { state } = useSystemState();
  const isMaintenanceDismissed = useSystemNoticeStore((notices) => notices.isMaintenanceDismissed);
  const softUpdateDismissedAt = useSystemNoticeStore((notices) => notices.softUpdateDismissedAt);
  const [launchedAt] = useState(Date.now);

  useEffect(() => {
    removeRetiredStores();
  }, []);

  // The first launch starts the quiet first session of interstitials (первый запуск начинает тихую первую сессию без межстраничной рекламы).
  useEffect(() => {
    useInterstitialStore.getState().markLaunched(launchedAt);
  }, [launchedAt]);
  const isBanned = useBanStore((ban) => ban.ban !== null);
  const hasLogin = useAccountStore((account) => account.hasLogin);
  const isLanguageNeeded = useSettingsStore(
    (settings) => settings.language === null && !isSystemLanguageSupported(),
  );
  const isConsentRequired = useIsConsentRequired();
  const isUpdateRequired = state.kind === "forcedUpdate";
  const isMaintenance = state.kind === "maintenance" && !isMaintenanceDismissed;
  const isSoftUpdateOpen =
    state.kind === "softUpdate" && !isSoftUpdateSnoozed(softUpdateDismissedAt, launchedAt);
  const isSignedIn =
    hasLogin && !isUpdateRequired && !isMaintenance && !isBanned && !isConsentRequired;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected
          guard={isLanguageNeeded && !isUpdateRequired && !isMaintenance && !isBanned}
        >
          <Stack.Screen name="onboarding/language" options={{ gestureEnabled: false }} />
        </Stack.Protected>
        {/* No guest mode for now: without an account only the sign-in screens are open (гостевого режима пока нет: без аккаунта открыты только экраны входа). */}
        <Stack.Protected guard={isSignedIn}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="daily" />
          <Stack.Screen name="friends" />
          <Stack.Screen name="editor/index" />
          <Stack.Screen name="editor/[id]" options={{ gestureEnabled: false }} />
          <Stack.Screen
            name="editor/tryout"
            options={{ presentation: "fullScreenModal", gestureEnabled: false }}
          />
          <Stack.Screen name="settings/index" />
          <Stack.Screen name="settings/deletion" />
          <Stack.Screen name="settings/devices" />
          <Stack.Screen name="settings/blocked-players" />
          <Stack.Screen name="user/[id]" />
          <Stack.Screen name="leaderboards" />
          <Stack.Screen name="profile/nickname" />
          <Stack.Screen name="arena/history/[id]" />
          <Stack.Screen name="arena/map/[id]" options={{ gestureEnabled: false }} />
          <Stack.Screen
            name="arena/onboarding"
            options={{ presentation: "fullScreenModal", gestureEnabled: false }}
          />
          <Stack.Screen
            name="arena/search"
            options={{ presentation: "fullScreenModal", gestureEnabled: false }}
          />
          <Stack.Screen
            name="arena/match/[id]"
            options={{ presentation: "fullScreenModal", gestureEnabled: false }}
          />
          <Stack.Screen
            name="arena/result/[id]"
            options={{ presentation: "fullScreenModal", gestureEnabled: false }}
          />
          <Stack.Screen name="play/index" options={{ presentation: "modal" }} />
          <Stack.Screen
            name="play/code"
            options={{ presentation: "fullScreenModal", gestureEnabled: false }}
          />
          <Stack.Screen
            name="play/[mode]/[id]"
            options={{ presentation: "fullScreenModal", gestureEnabled: false }}
          />
          <Stack.Screen name="account/password" options={{ presentation: "modal" }} />
          <Stack.Screen name="account/email" options={{ presentation: "modal" }} />
        </Stack.Protected>
        <Stack.Protected
          guard={!hasLogin && !isLanguageNeeded && !isUpdateRequired && !isMaintenance}
        >
          <Stack.Screen name="account/sign-in" options={{ gestureEnabled: false }} />
          <Stack.Screen name="account/sign-up" options={{ gestureEnabled: false }} />
          <Stack.Screen name="account/code" />
          <Stack.Screen name="account/forgot" />
        </Stack.Protected>
        <Stack.Protected guard={isUpdateRequired}>
          <Stack.Screen name="system/update" options={{ gestureEnabled: false }} />
        </Stack.Protected>
        <Stack.Protected guard={isMaintenance}>
          <Stack.Screen name="system/maintenance" options={{ gestureEnabled: false }} />
        </Stack.Protected>
        <Stack.Protected guard={isBanned && !isUpdateRequired && !isMaintenance}>
          <Stack.Screen name="system/banned" options={{ gestureEnabled: false }} />
        </Stack.Protected>
        <Stack.Protected
          guard={isConsentRequired && !isBanned && !isUpdateRequired && !isMaintenance}
        >
          <Stack.Screen name="account/consents" options={{ gestureEnabled: false }} />
        </Stack.Protected>
      </Stack>
      {state.kind === "softUpdate" ? (
        <SoftUpdateSheet
          isOpen={isSoftUpdateOpen}
          version={state.version}
          storeUrl={state.storeUrl}
          onDismiss={useSystemNoticeStore.getState().dismissSoftUpdate}
        />
      ) : null}
      <LinkOfferHost isSuspended={isSoftUpdateOpen} />
      {isSignedIn ? (
        <>
          <ArenaSocketHost />
          <ChallengeBannerHost />
        </>
      ) : null}
      <AdsConsentHost />
      <SplashGate />
    </>
  );
};

export default RootStack;
