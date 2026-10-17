# 0027. Interstitial ads

Date: 2026-10-12. Asked by: stage 3 task 7 (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | A «finished level» | Campaign levels, won or lost; not the daily, not the tutorial. No matches yet. | Part 1 §6.5 |
| 2 | Which tap shows it | Any way out of the result sheet (win: «Дальше», «Заново», «Выход»; lose: «Заново», «К уровням») when its turn has come. | Part 11 ADS-06 |
| 3 | «Right after a rewarded ad» | A rewarded ad counts as a show for the «once per 3 min» rule. | Part 1 §6.5, Part 11 ADS-07 |
| 4 | Storage | The finished-level counter, the last show time and the first launch time live on the device in MMKV (a versioned store with a migration). | rule 11 |
| 5 | Rule values | From `bootstrap.config` (`ads.interstitial.everyN`, `minIntervalSec`, `minLevel`), else 3 / 180 / 10 of Part 6 §7.4. | Part 6 §7.4, 0014 #16 |
| 6 | «Level 10» | The player's current campaign level number. | Part 11 ADS-05 |
| 7 | Before a show | The ATT consent step (0025); no pause, the show is between levels. | Part 8 §10.1 |
| 8 | Mock provider | Shows at once without UI (as 0025 #3); no fill — nothing shown, the counter is kept. | 0025 #3 |
| 9 | Preload | After the 2nd finished level of a cycle (Part 8 §10.1); a no-op on the mock provider. | Part 8 §10.1 |

## Implementation notes

Date: 2026-10-12. Taken by the agent while implementing; to be confirmed by the developer.

| # | Topic | Decision | Source |
| --- | --- | --- | --- |
| 10 | Replays | A replayed level counts like any finished level. | 0027 #1 |
| 11 | Preload | From one level before the turn on, while not yet loaded: the counter keeps growing while a show is not allowed (level < 10, quiet first session, interval). A failed load is retried on the next finished level. | Part 8 §10.1 |
| 12 | Failures | Any load or show failure counts as no fill; the player moves on, the counter waits (Sentry reporting once it is set up). | 0027 #8 |
| 13 | Quiet first session | 10 minutes from the first launch; a constant, as remote config has no key for it. | Part 1 §6.5 |
| 14 | Double tap | Leaving a result is guarded, so a second tap neither counts the level again nor navigates twice. | — |

## Consequences

Task 7 adds interstitials to `AdsProvider` and the mock, a persisted interstitial store, the show rule, the bootstrap config reading, and the show on leaving the campaign result sheets.
