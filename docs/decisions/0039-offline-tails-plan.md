# 0039. Plan after stage 4: offline tails, then stage 5 on mocks

Date: 2026-10-20. Asked by: plan after stage 4 (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | What comes next | First the stage 1–4 tails that need no backend, then stage 5 on mocks. Home blocks of stage 5 (event banner, friend challenges, weekly leaderboard place) stay hidden until stage 5 («no data — block hidden»). | Part 12 §2, Part 4 §3 |
| 2 | Order of the tails | (1) settings (Part 4 §12.1): toggles are stored, sound has no effect until assets exist (0013); (2) the full Home (§3): «Текущая игра» hero with a board preview and «Продолжить», quick links, «Сегодня», «Кампания пройдена»; (3) splash and app onboarding (§2.1–2.2): language, level 1 coach marks, Home coach marks after level 3; (4) level editor and play by code (§11.2–11.3); (5) content of worlds 3–8. Each task starts with its own clarification round. | Part 4 |
| 3 | Worlds 3–8 content and covers | The agent builds the layouts by the world plan and the difficulty curve (Part 6, Part 1 §8.2), limits from the bot, everything passes `content:check`; the developer reviews. The agent also designs the covers of worlds 5–8 in the app style (like the `world1`–`world4` gradients of design 21.x), clear and good-looking; they are shown to the developer for approval. | 0012, Part 6 |
| 4 | Stage 5 | On mocks like stage 4: friends, leaderboards, events by the Part 7 contract in `shared/api/mocks`; the friend challenge through the fake WS server; push only on the client side (permission, pre-screen 28.7, categories in settings), no real sending. Its detailed plan is agreed before it starts. | Part 12 E5 |
| 5 | Out of this block | Sentry, analytics, EAS builds and stores, real ad SDKs, App Attest / Play Integrity, Lottie and Rive, sound — stage 6 or needs keys and assets. | Part 12 §2 |

## Consequences

The next task is settings (tail 1). The TODO in `widgets/level-list/ui/world-header.tsx` about the designer's covers is resolved by tail 5.
