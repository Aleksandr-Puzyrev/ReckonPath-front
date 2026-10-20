# 0038. Season summary and arena ban

Date: 2026-10-19. Asked by: stage 4 task 10 (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Season summary contract | `GET /arena` gets `lastSeason: { seasonId, peakLeague, peakDivision, rank \| null, wins, rewards[], trophiesBefore, trophiesAfter, claimed } \| null`; `POST /arena/season/summary/claim` is idempotent (a repeat returns `duplicate`, ARN-21) (**to agree with the backend**). Rewards are shown as the server sends them. | Part 1 §5.8, Part 7 §5 |
| 2 | Where the summary is shown | A modal on the arena home at the first visit after the season change; the app launch pop-up queue is a separate later task. | Part 4 §8.9, Part 1 §8.2 |
| 3 | Closing without «Забрать» | «Сезон N начался» claims the rewards if they are not claimed yet. | Part 4 §8.9 |
| 4 | Ban texts | Arena ban title «Арена недоступна» / «Arena access suspended» (`system.banned.arenaTitle`); full ban «Доступ ограничен»; body by Part 5 «Причина: {{reason}}. До {{date}}», a separate line «ID: {{id}}»; permanent «Причина: {{reason}}. Навсегда» / «Reason: {{reason}}. Permanently». | Part 5, Part 4 §12.4, design 28.4 |
| 5 | Appeal form | Bottom sheet «Обжаловать»: multiline field «Опиши, что произошло» / «Describe what happened» (≤ 1000 chars), «Отправить» / «Send», toast «Обращение отправлено» / «Appeal sent»; `POST /support/tickets` with `topic: "ban_appeal"` and diagnostics (version, device, player ID). | Part 7 §6, Part 4 §12.4 |
| 6 | Detecting an arena ban | `GET /arena` → 403 `BANNED` with `scope: "arena"` → the arena home body is replaced by the ban screen (tab bar stays), «К кампании» → `/levels`; `BANNED` from `queue.join` or WS close 4003 → back to the arena home, which refetches and shows the ban. | Part 7 §2, Part 11 ACC-14 |
| 7 | Full ban (`scope: "all"`) | The same screen without «К кампании», non-closable like the maintenance system screen, on `BANNED` from any request. | Part 4 §12.4 |
| 8 | Reason, date, ID | `reason` displayed as received (server-localized); the date by locale («12 октября»); the player ID is `id` from `GET /me` as is. | Part 8 §11 |
| 9 | Summary screen (18.3) | Peak league emblem (`shared/ui/league-emblem`), «Место #N в мире · M побед» (no place when `rank` is null), rewards list, the reset counter «3 120 → 2 560» animated with Reanimated (final value under reduced motion), the design line «выше 2 000 → 2 000 + половина остатка · RP обнулены», «Забрать» by Part 5, then the existing season track «Забрано». | design 18.3, Part 5 |
| 10 | Mock | The mock starts in season 2 with the season 1 summary (design rewards) so the modal is visible in dev; claiming credits the wallet. | 0028 #1 |
| 11 | Out of the task | Search lock for 2 minutes and matches at the season change (PVP-26, server), leaderboards, the «Конец сезона» push, the launch pop-up queue. | Part 11 PVP-26 |

## Consequences

Item rewards (the design's «Рамка S07») are not shown in the summary yet: the mock catalog has no season items, a `TODO` stays in the rewards card, as on the season track (0031 #2). The appeal sends an empty `userId` while `GET /me` is not loaded (**to agree with the backend**).

The arena contract gets `lastSeason` and the summary claim endpoint; the ban details and the support ticket endpoint are added to the contract. The arena home handles `BANNED` and the season summary modal; a system ban screen joins the system screens.
