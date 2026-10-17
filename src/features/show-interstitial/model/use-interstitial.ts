import { isInterstitialDue, prepareAdsConsent, useInterstitialStore } from "@entities/ad";
import type { InterstitialRules } from "@entities/ad";
import { useConfigNumber } from "@entities/app-config";
import { CAMPAIGN_LEVELS, CAMPAIGN_WORLDS } from "@entities/level";
import { currentLevelId, useProgressStore } from "@entities/progress";
import { adsProvider } from "@shared/ads";

// Part 6 §7.4 defaults when remote config lacks them (значения Части 6 §7.4, если их нет в remote config).
const DEFAULT_RULES: InterstitialRules = { everyN: 3, minIntervalSec: 180, minLevel: 10 };
const PRELOAD_BEFORE_DUE = 1;

// A failed load is no fill: the next finished level tries again (неудачная загрузка — это отсутствие рекламы: следующий уровень попробует снова).
const preload = async () => {
  try {
    await adsProvider.loadInterstitial();
    useInterstitialStore.getState().setPreloaded(true);
  } catch {
    useInterstitialStore.getState().setPreloaded(false);
  }
};

const useInterstitialRules = (): InterstitialRules => ({
  everyN: useConfigNumber("ads.interstitial.everyN", DEFAULT_RULES.everyN),
  minIntervalSec: useConfigNumber("ads.interstitial.minIntervalSec", DEFAULT_RULES.minIntervalSec),
  minLevel: useConfigNumber("ads.interstitial.minLevel", DEFAULT_RULES.minLevel),
});

const currentLevelNumberOf = (id: string | null) =>
  CAMPAIGN_LEVELS.find(({ level }) => level.id === id)?.number ?? CAMPAIGN_LEVELS.length + 1;

export const useInterstitial = () => {
  const rules = useInterstitialRules();
  const best = useProgressStore((state) => state.best);
  const currentLevel = currentLevelNumberOf(currentLevelId(CAMPAIGN_WORLDS, best));

  // The ad is preloaded from one level before its turn on, as the counter keeps growing while a show is not allowed yet (Part 8 §10.1) (реклама предзагружается начиная с уровня до своей очереди: счётчик растёт и пока показ ещё не разрешён).
  const finishLevel = () => {
    useInterstitialStore.getState().countFinishedLevel();
    const { finishedLevels, isPreloaded } = useInterstitialStore.getState();
    if (finishedLevels >= rules.everyN - PRELOAD_BEFORE_DUE && !isPreloaded) void preload();
  };

  // Any failure counts as no fill: the player moves on and the counter waits for the next turn (любой сбой считается отсутствием рекламы: игрок идёт дальше, счётчик ждёт следующей очереди).
  // TODO: report unexpected show failures to Sentry once it is set up
  const showIfDue = async () => {
    const moment = { ...useInterstitialStore.getState(), currentLevel, now: Date.now() };
    if (!isInterstitialDue(moment, rules)) return;
    try {
      await adsProvider.showInterstitial(await prepareAdsConsent());
      useInterstitialStore.getState().markInterstitialShown(Date.now());
    } catch {
      return;
    }
  };

  return { finishLevel, showIfDue };
};
