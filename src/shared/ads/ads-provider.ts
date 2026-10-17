export interface RewardedShow {
  unitId: string;
  customData: string;
  isPersonalized: boolean;
}

export interface RewardedResult {
  rewarded: boolean;
}

export class AdUnavailableError extends Error {
  constructor() {
    super("No ad to show");
    this.name = "AdUnavailableError";
  }
}

export interface AdsProvider {
  init: () => Promise<void>;
  loadRewarded: (unitId: string) => Promise<void>;
  showRewarded: (show: RewardedShow) => Promise<RewardedResult>;
  loadInterstitial: () => Promise<void>;
  // Resolves once the ad was shown and closed; rejects (AdUnavailableError for no fill) when nothing was shown (выполняется, когда реклама показана и закрыта; отклоняется (AdUnavailableError при отсутствии), если ничего не показано).
  showInterstitial: (isPersonalized: boolean) => Promise<void>;
}
