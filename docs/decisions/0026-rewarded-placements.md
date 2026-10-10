# 0026. Rewarded placements

Date: 2026-10-10. Asked by: stage 3 task 6 (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Ad row in «Как заработать» | Look of design 22.5: «Смотреть рекламу · +◆ 5» and «сегодня 3 / 5», the counter is ads watched (ADS-01). At the limit «Снова завтра» (Part 5, ADS-04). | Part 4 §9.4, Part 5 `earn.*`, Part 11 ADS-01, ADS-04, design 22.5 |
| 2 | Reward not in 10 s | ◆ 5 row: toast «Награда придёт чуть позже», one more check of the intent a minute later, then the balance refreshes (E3-2). Continue and streak restore: toast «Реклама недоступна», nothing granted, the button is available again. | Part 11 ADS-02, Part 12 E3-2, 0020 #8 |
| 3 | Flow | Consent (ATT pre-screen, 0025) → `POST /ads/intent` → show → poll the status every second for up to 10 s → reward; continue and streak then call `POST /continue` / `POST /streak/restore` with `adIntentId`. Not watched or no fill — toast «Реклама недоступна», the limit is not charged. | Part 1 §3.5, Part 7 §4, §6, Part 11 LVL-14, ADS-10 |
| 4 | Ad button on the lose sheet | Design 12.4: «Реклама» + «осталось N сегодня»; loading «Загрузка…» + «пара секунд»; no ad «Реклама недоступна» + «попробуй позже»; offline «Нет сети» + «реклама недоступна»; hidden at the limit (LVL-16). Also in the daily; «не в рейтинге» comes from the server (DLY-06). | Part 4 §6.2, Part 11 LVL-13…16, DLY-06, design 12.4 |
| 5 | Pause during an ad | Not needed: the continue starts from a lost game, there is no timer or music now. Closes 0025 #9 on this point. | Part 8 §10.1 |
| 6 | Streak restore for an ad | «За рекламу» on the streak card works with the same flow; success shows the toast and texts of the ◆ restore (0018 #6). | Part 4 §7.2, Part 11 DLY-09 |
| 7 | ◆ 5 for an ad | After the reward the balance and the counter refresh; no separate toast (ADS-01). | Part 11 ADS-01 |
| 8 | Out of scope | «Удвоить ● за рекламу» (0020 #7), interstitials (task 7), the wallet badge for a late reward (ADS-02, no badge in the design). | — |

## Implementation notes

Date: 2026-10-10. Taken by the agent while implementing; to be confirmed by the developer.

| # | Topic | Decision | Source |
| --- | --- | --- | --- |
| 9 | Where the flow lives | `watchRewardedAd`, the consent step and the pre-screen moved to `entities/ad`: three features use them, and features cannot import each other. | rule 06 |
| 10 | ◆ amount | `GEMS_FOR_AD = 5` in `shared/config`, to come from remote config with the continue price. | Part 1 §6.5 |
| 11 | Toast texts | Not watched / no fill uses `ads.unavailable` of Part 5 («Реклама сейчас недоступна»); the button shows the design's short «Реклама недоступна». | Part 5, design 12.4 |
| 12 | Messages | One `AdMessageKey` type (`entities/ad`) for error and ad toasts; `EarnSheet` gets `onMessage`, and Home now has a toast. | — |
| 13 | Lose-sheet caption | «осталось N сегодня» in lower case, as in design 12.4 (Part 5 «Осталось»). | design 12.4 |
| 14 | Late reward recheck | A minute later the balance and the counters are refreshed (the server has credited by the SSV), not the intent itself. | 0026 #2 |
| 15 | Status request failing while polling | Counts as one more wait; after 10 s the outcome is «late», so the player sees «Награда придёт чуть позже», not an error. | Part 11 ADS-02 |

## Consequences

Task 6 adds a shared rewarded-ad flow (consent, intent, show, poll), the ◆ 5 row in `EarnSheet`, the ad continue on the lose sheet and the ad streak restore.
