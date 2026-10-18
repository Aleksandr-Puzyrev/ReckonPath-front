# 0028. Stage 4 plan: arena

Date: 2026-10-17. Asked by: stage 4 (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Backend and contracts | As 0014 #1–2 and 0020 #1: no backend, mocks. Arena REST in `contracts/openapi.yaml` from Part 7 §5; WebSocket JSON Schemas in `contracts/ws/` from Part 7 §8. What Part 7 lacks (full `match.snapshot`, match details in history…) is proposed **to agree with the backend**. Part 7 §8 wins over the Part 1 §10.4 protocol (two connections — common entry and match node; message names; time format). | Part 7 §5, §8, Part 1 §10.4, Part 8 §9.2 |
| 2 | WebSocket mock | `shared/ws` has a transport interface; dev builds and tests use a built-in fake game server that runs the match by Part 6 §4.2 and plays the opponent bot with the engine solver. It lives next to the mocks (not in the engine, 0008 #5) and never reaches release builds; it ports the engine's test-only `simulate-match` logic. | 0008 #5, #12, 0014 #17 |
| 3 | Training match | Through the same WebSocket as a regular match with an easy bot (the fake server in mocks); `onboardingDone` stays on the server. | Part 1 §5.12 |
| 4 | Animations | Search radar and coin flip — simple Reanimated / Skia versions; emotes — text phrases of design 16.9, no Lottie; the league-change screen without an emblem animation. Rive and Lottie stay postponed (0013 #1, 0020 #4). | Part 8 §2.2, §4.1 |
| 5 | Out of stage 4 | Leaderboards screen (18.1–18.2, E5-2, stage 5) and the «Лидеры» block of the arena home (hidden); step-by-step replay (32.4, after MVP by Part 1 §1.4) — history shows both maps without replay; friend challenge and «Добавить в друзья» (stage 5). The arena ban screen (28.4) is in stage 4 (0015 #2). | Part 1 §1.4, Part 12 E5-2 |
| 6 | Task order | (1) contract and data layer: arena REST, WS schemas, mocks, arena / map / season entities; (2) `shared/ws`: connection, ping, reconnect, clock offset, `seq` order; fake game server; (3) arena home: locked before level 12, offline, league and trophies, format, «Моя карта», season track, history; (4) map editor; (5) search → VS: link sheet before the first match (0019 #4), «no map», «match on another device»; (6) live match; (7) match result and league-change screen; (8) «Против карты» match; (9) arena onboarding: rule cards, training match, editor tutorial; (10) season summary and arena ban screen. | Part 12 §2 stage 4 |
| 7 | Turn time | From the league format: 5 / 7 / 10 s (Part 1 §5.2, Part 6 §7.4, Part 7, PVP-30); «5 с на ход» elsewhere in the spec is outdated. | Part 11 PVP-30 |
| 8 | `expo-keep-awake` | Part 8 stack; installed with the live match task (dev build rebuild). | Part 8 §2.4 |
| 9 | PvP settings | «Чужие скины в PvP» and «Подтверждение тапа в PvP» keep their defaults until the settings screen; opponent skins in a match are out of the stage (0024 #10). | Part 1 §7.5 |
| 10 | Server-side | The 5k CCU load test and the «two devices» demo need the real server; the client provides mocks and tests only. | Part 12 §2 |

## Consequences

Stage 4 starts with task 1. Each task begins with its own clarification round for its screens; conflicts inside a screen (texts, design-only rewards, Bronze targets, onboarding order) are asked there.
