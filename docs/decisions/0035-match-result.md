# 0035. Match result and league change

Date: 2026-10-19. Asked by: stage 4 task 7 (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Match rewards | The spec, not the design: coins only for a win (● 40, ◆ 3 for the first three wins a day), XP for every match (+5, a win +10). The screen shows RP (`end.rp`) and the rewards as the server sends them; the fake server adds an XP row (`{ xp: N }`) and credits XP in the mock. | Part 1 §5.8, §8, PVP-22, PVP-25 |
| 2 | Full-screen moment | Only on a **league** change: Part 5 «Новая лига: {league}» / «Ты в лиге {league}», the emblem, «Дальше»; on a promotion the design line «Упасть ниже {league} в этом сезоне нельзя» (PVP-24); no rewards (none in the spec or contract). A division change is only the bar animation on the result screen. | E4-7, design 17.5, Part 5 §4 |
| 3 | Result screen | `arena/result/[id]` replaces the task 6 overlay: the match moves there on `match.end`. Title, reason, both maps revealed with taps, «+N кубков» counter and the `LeagueProgress` bar animated from the old to the new trophies, a reward row (RP, ●, ◆, XP), `match.botTrophies` for a bot. | Part 4 §8.6, design 17.1–17.3 |
| 4 | Reason | Without past tense about the opponent (Part 5 rule): targets — «Все сигналы найдены за N ходов» (the winner's turns); a draw — «оба нашли все цели — правило равных ходов» (design); a win by surrender / afk, turn limit, annulled — Part 5; my own surrender or afk — no reason line. | Part 5 §4 |
| 5 | Map tap | A bottom sheet with the map at full width. | Part 4 §8.6 |
| 6 | Buttons | «ЕЩЁ БОЙ» starts the search the same way as «В бой» (map, network, maintenance checks); «На арену»; no «Добавить в друзья» and «⋯» menu (friends are stage 5, no report API in Part 7). | 0028 #5, Part 1 §5.10 |
| 7 | Interstitial | Matches count in the same counter as levels; shown when leaving the result screen, with the existing frequency rules. | Part 1 §6.5 |
| 8 | Effects | Haptics: win `success`, loss `warning`, league up `success`; no sounds. | Part 3 §9 |
| 9 | Data | After `match.end` the arena profile, history and wallet are refreshed. | — |

## Implementation notes

* The mock player keeps total XP (`mock-player`); `/me` derives level, xp and `xpToNext` with the engine formula (the old fixed `xpToNext: 100` was a mock value; level 1 now needs 50).
* The search start moved to `widgets/find-match` (the arena home and the result screen share it); the result screen replaces the route with the search.
* `LeagueProgress` is a shared widget of `widgets/arena-hero` with an animated fill from the old to the new trophies (`motion.duration.slower`, instant with reduced motion); the trophies number is not counted up.
* Reward rows the client does not know (items) are skipped until item rewards exist.
* The interstitial counter is the level one (`finishLevel`); leaving the result counts the match.
* `{league}` in `league.up` / `league.down` / `league.floor` takes the league code («GOLD»), as the design and the arena header show it; Part 5 has no localized league names.
* The result screen keeps a snapshot of the finished match, so «Ещё бой» can reset the session while its checks (no map, link offer) still show on this screen; Android back leaves the same way as «На арену».
