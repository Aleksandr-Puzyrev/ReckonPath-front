import { AdUnavailableError, adsProvider } from "@shared/ads";

import { fetchAdIntentStatus, requestAdIntent } from "../api/ad-queries";

import type { AdIntentStatus, AdPlacement } from "./ad-type";
import { prepareAdsConsent } from "./prepare-ads-consent";

export type RewardedOutcome =
  | { kind: "rewarded"; adIntentId: string; status: AdIntentStatus }
  | { kind: "late"; adIntentId: string }
  | { kind: "unavailable" };

const POLL_MS = 1000;
const POLL_ATTEMPTS = 10;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const showAd = async (unitId: string, customData: string, isPersonalized: boolean) => {
  try {
    await adsProvider.loadRewarded(unitId);
    const { rewarded } = await adsProvider.showRewarded({ unitId, customData, isPersonalized });
    return rewarded;
  } catch (error) {
    if (error instanceof AdUnavailableError) return false;
    throw error;
  }
};

// The reward is the server's word after the network's SSV, so the client asks for it once a second for up to 10 s (награда — слово сервера после SSV сети, поэтому клиент спрашивает о ней раз в секунду до 10 с).
// A failed status request counts as one more wait: the ad is watched, and the SSV still credits on the server (неудачный запрос статуса считается ещё одним ожиданием: реклама досмотрена, и SSV всё равно начислит на сервере).
const statusOf = async (adIntentId: string) => {
  try {
    return await fetchAdIntentStatus(adIntentId);
  } catch {
    return null;
  }
};

const pollReward = async (adIntentId: string): Promise<RewardedOutcome> => {
  for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
    const status = await statusOf(adIntentId);
    if (status?.status === "rewarded") return { kind: "rewarded", adIntentId, status };
    if (status?.status === "expired") return { kind: "unavailable" };
    await wait(POLL_MS);
  }
  return { kind: "late", adIntentId };
};

export const watchRewardedAd = async (
  placement: AdPlacement,
  ref?: string,
): Promise<RewardedOutcome> => {
  const isPersonalized = await prepareAdsConsent();
  const intent = await requestAdIntent(placement, ref);
  const isWatched = await showAd(intent.unitId, intent.customData, isPersonalized);
  if (!isWatched) return { kind: "unavailable" };
  return pollReward(intent.adIntentId);
};
