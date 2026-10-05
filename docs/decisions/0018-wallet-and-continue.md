# 0018. Wallet, continue for ◆, streak restore

Date: 2026-10-03. Asked by: stage 2 task 6 (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Continue for ◆ offline | Online: `POST /continue`, moves are added after the answer. Offline: continue at once when the last known balance covers the price; the shown balance does not change; the server charges it with the attempt (`continueMethod: "emeralds"`) and checks the balance. **To agree with the backend:** `attempts:batch` charges ◆ for an offline continue, and only when no `POST /continue` was paid for that `attemptId` — an online continue also arrives with `continueMethod: "emeralds"` and must not be charged twice. Online, a game without an `attemptId` gets no continue (`errors.generic`). | Part 1 §3.5, rule 10 |
| 2 | Where the balance is shown | A `TopBar` (emblem, «RECKON PATH / SIGNAL HUNT», ◆ and ● wallet chips) on Home and Levels now; the other tab screens get it with their own tasks. The emblem is `design/assets/reckon-emblem.png` (design 19.1), scaled down for the app. | Part 4 §1.1, design 19.1 |
| 3 | «Как заработать» sheet | «Не хватает ◆ N», the ◆ and ● balances, the «Пеленг дня» row with a link, «Закрыть». No amounts on the rows (design 12.6 says «+◆ 3 за победу» for the daily, Part 1 §4.4 gives ● for it). Texts: «Где получить изумруды:» / «Where to get emeralds:» (design 12.6 says «кристаллы»; the game's term is изумруды); «Не хватает» is its own key `earn.short` rather than `shop.notEnough`, because the ◆ icon sits between the word and the number. Ad, arena, season and invite rows come with those features. | Part 4 §9.4, design 12.6 |
| 4 | The dev-only free continue (0010 #4) | Removed. | 0010 #4 |
| 5 | Mock balance | The mock guest starts with ◆ 2 640 and ● 18 420 (design 3.1). | — |
| 6 | Streak restore (design 20.3) | «Серия N дней прервалась» with «вернуть можно ещё N ч» from `restoreUntil`; «За рекламу» disabled («Реклама недоступна») until stage 3 and «◆ N» with the price from `GET /streak`; after success the toast «Серия N дней восстановлена» (changed 2026-10-05 from «−◆ N · серия восстановлена», developer) and «Серия восстановлена · Не пропусти сегодняшний пеленг». Only on the daily screen; no streak block on Home (19.4) yet. | Part 4 §7.2, design 20.3 |
| 7 | Out of scope | Rewards on the win sheet (● / XP / ◆), ads (continue, restore, earn row), the shop and purchases. | — |

Already fixed by the spec: continue costs ◆ 15, once per game; not enough ◆ — red price, tap opens «Как заработать» (Part 4 §6.2); the balance comes from `GET /me`, every response with `wallet` updates it (LVL-26); restore price from `GET /streak` (◆ 30); «Восстановление — раз в неделю» when yesterday was missed and `restorable = false` (DLY-10, closes 0017 #11).
