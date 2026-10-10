# 0025. Ads layer, consent and the ads contract

Date: 2026-10-10. Asked by: stage 3 task 5 (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | System ATT request now | Yes: the pre-screen and the real system request through `expo-tracking-transparency` (Part 8 stack; native, the dev build is rebuilt). Usage description from design 28.6: «Данные будут использоваться для рекламы по интересам.» / "Your data will be used to deliver personalized ads.". UMP comes with the AdMob SDK. | Part 8 §10.1, Part 11 ADS-08, design 28.6 |
| 2 | Ad counters before an intent | `GET /ads/limits` → `{ gems: { used, max, resetAt }, continue: {…}, streak: {…} }` (**to agree with the backend**). `/ads/intent` and `GET /ads/intent/{id}` follow Part 7 §6. | Part 7 §6, Part 4 §9.4 |
| 3 | Mock provider in dev builds | No UI: after a second the ad counts as watched and the reward goes through the mock SSV. No fill and an early close are covered in tests. | 0020 #2 |
| 4 | First ad network | Not answered yet (the answer was about sign-in, see below); asked again with the real SDKs. | 0020 #2 |
| 5 | Pre-screen texts | Design texts (as 0022 #4): «Реклама по интересам», «Помоги нам показывать подходящую рекламу — так игра остаётся бесплатной. Решение можно поменять в настройках.», «ПРОДОЛЖИТЬ». | Part 5 `ads.att.*`, design 28.6 |
| 6 | When the pre-screen shows | iOS only, once, before the first ad when ATT was never asked; a refusal means non-personalised ads. Task 5 provides a «prepare consent before an ad» step; task 6 calls it. | Part 4 §2, Part 11 ADS-08 |
| 7 | `AdsProvider` | Part 8 §10.5: init, load and show a rewarded ad with `customData`, result `{ rewarded }`. Interstitials in task 7. | Part 8 §10.5 |
| 8 | Network from `bootstrap.adsNetwork` | Any value maps to the mock provider for now. | Part 8 §10.1 |
| 9 | Out of scope | Placements and rewards (task 6); game pause during an ad (task 6); «Настройки рекламы» in settings (no settings screen); analytics `ad_shown` / `ad_reward` (no analytics layer); the integrity token (0020 #7). | — |

## Implementation notes

Date: 2026-10-10. Taken by the agent while implementing; to be confirmed by the developer.

| # | Topic | Decision | Source |
| --- | --- | --- | --- |
| 10 | Localised usage description | The plugin keeps the EN text; RU comes from `locales/ru.json` through the app config `locales` with `CFBundleAllowMixedLocalizations`. | Expo localization guide |
| 11 | Mock limits | Remote-config defaults gems 5, continue 2, double 5 (Part 6 §7.4); streak 1 and event 5 are mock choices. A limit counts on the reward, not on the intent (ADS-10). | Part 6 §7.4, Part 11 ADS-10 |
| 12 | Consent state | The pre-screen flag lives in an in-memory `useAdsConsentStore` (`entities/ad`); whether tracking was asked is kept by the system. | rule 11 |
| 13 | No fill and early close | The provider interface reports them (`AdUnavailableError`, `rewarded: false`); their flows and tests come with the placements in task 6. | 0025 #3 |

## Sign-in (answer given to question 4)

VK ID is not planned for now: sign-in stays by login and password. Updates 0019 #1 and #21.

## Consequences

Task 5 adds `expo-tracking-transparency`, `shared/ads` with `AdsProvider` and the mock provider, the ATT pre-screen, the ads contract with mocks (`/ads/limits`, `/ads/intent`, `GET /ads/intent/{id}`) and the entity queries for limits.
