# 0051. What the local guest sees (backend task 3b)

Date: 2026-10-25. Asked by: clarify-task, backend connection task 3b (0050 #1). Answered by: developer.

General rule: server requests are not sent for a guest; the dev mocks show the guest the same as the real backend would.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Arena and showroom tabs | Both tabs show a block in the profile guest card style with «Зарегистрироваться» and «Войти» instead of their content. Texts approved: `account.gate.arenaTitle` «Арена — для аккаунта» / «The arena needs an account»; `account.gate.arenaBody` «Войди или зарегистрируйся, чтобы сражаться с игроками» / «Sign in or sign up to fight other players»; `account.gate.shopTitle` «Витрина — для аккаунта» / «The showroom needs an account»; `account.gate.shopBody` «Войди или зарегистрируйся, чтобы покупать и собирать коллекцию» / «Sign in or sign up to buy items and build your collection». | 0048 #8, #10 |
| 2 | Home | No wallet chips in the TopBar (all tabs), no showroom drop card, no trophies or league on the arena card, no streak restore card; the arena card leads to the arena tab block. | 0048 #8, #9 |
| 3 | Continue | For emeralds — no button; for an ad — works without the server: the ad, then +3 moves; the daily limit of 2 (Part 6 §7.4) is counted on the device. | 0048 #9, Part 6 §7.4 |
| 4 | Daily | Day levels are generated on the device without server overrides; no streak or restore block; the calendar comes from the results kept on the device; no leaderboard preview (leaderboards need an account). | 0048 #8 |
| 5 | My levels | The guest draws, tests, and shares a level by code (local); «Сохранить» to My levels opens the link sheet. | 0048 #8, 0043 |
| 6 | Profile | Header «Гость» (`settings.account.guest`), the guest card below, no collection. | 0050 #9 |
| 7 | Settings | No «ID игрока» and «Удалить аккаунт» rows; a language change is local only, no `PATCH /me`. | 0040 |
| 8 | Board skin | The default skin (no inventory or loadout). | 0024 |
| 9 | Rewards and attempts | No rewards on the win sheet (as now); attempts stay on the device and reach the server after sign-up once the backend has `/attempts:batch`. | 0048 #9 |
| 10 | Support | Available to a guest, without the player id in the diagnostics. | — |

## Round 2 (during implementation)

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 11 | The rewarded ad unit comes only from the server's ad intent; a guest has no server | The client config holds the rewarded unit for the guest: `EXPO_PUBLIC_REWARDED_UNIT_ID_IOS` and `EXPO_PUBLIC_REWARDED_UNIT_ID_ANDROID`; empty in dev builds, where the mock provider shows the ad. The guest watches the ad without the server; +3 moves and the limit of 2 a day are counted on the device. | 0025, Part 6 §7.4 |

## Consequences

* The guest's ad continue limit follows the device date, so a changed clock can reset it; accepted, no currency is involved.
* An empty rewarded unit in a release build makes the guest's ad continue «unavailable»; the units must be set before the release.
* Account data left in the persisted cache is dropped when the app starts as a guest or an account turns into one; the UI checks the account flag as well, not only the disabled requests.
