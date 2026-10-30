# 0048. Connecting the client to the backend: plan

Date: 2026-10-25. Asked by: clarify-task (plan level) after decisions 0046–0047. Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Mocks and the real backend together | Hybrid in dev builds: an explicit list of paths goes to the backend, everything else to the mocks; the list grows as the backend implements endpoints. Mocks and the backend share no data. | 0014 |
| 2 | The backend has no guest | The guest lives only on the device and plays offline; server features need an account. Supersedes the silent server guest of 0015. Details in round 2. | 0015, 0019 |
| 3 | Campaign | The client keeps playing locally; finished attempts wait for `/attempts:batch` and `/progress` on the backend (requirements in `backend-discrepancies.md`), and sync to the mocks until then. | Part 8 §1.3, 0016 |
| 4 | Where to test | The developer runs the backend locally at `http://127.0.0.1:8080` (base URL `http://127.0.0.1:8080/api`; Android emulator via `adb reverse tcp:8080 tcp:8080`). The agent only reads the backend; manual checks on the dev build are the developer's, the agent covers the logic with tests on backend-format mocks. | — |
| 5 | Task order | 1) hybrid routing and config; 2) version and maintenance instead of `/bootstrap`, store link by install source; 3) sign-in and sign-up in the backend format (email, device, email code screen, consents); 4) profile (`GET`/`PATCH /me`, deletion, wallet from `GET /wallet`); 5) devices and push tokens with the stage 5 push task; 6) campaign once the backend has the offline endpoints. Features of 0046 #5 join tasks 3–4 where they belong or go separately. | — |
| 6 | Endpoint shape differs | The client adapts to the backend's existing endpoint (as 0047); a missing endpoint waits for the backend and goes to the handoff. | 0047 |
| 7 | Missing on the backend (`/bootstrap`, `/continue`, arena …) | Stays on the mocks until the backend implements it. | — |

## Round 2: the local guest (refines #2)

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 8 | What a guest can do | Without an account: campaign, daily (generated on the device), level editor, play by code, settings, rules. With an account only: arena, shop and purchases, wallet, rewards for ads, friends, leaderboards, events. | Part 1 §7.6 |
| 9 | Currency for a guest | No wallet: level rewards are neither credited nor shown; «+3 хода» for emeralds is unavailable, «+3 хода» for an ad works (no currency involved). After sign-up the campaign stars and the rewards for past wins reach the server once the backend has `/attempts:batch`. | Part 8 §1.3 #2, 0018 |
| 10 | Closed sections for a guest | The link sheet of design 26.1 (sign in / sign up) with a headline for the place; texts approved in task 3. The spec's link offers (after level 6 and others) stay; the arena and purchases become required entry points. | Part 1 §7.6, 0019 |
| 11 | Sign-up | The backend creates a new empty account after the email code; the guest's stars stay on the device and merge with the server by maximum once `/progress` exists. | 0016 #1 |
| 12 | Sign-in to an existing account | The 0019 #14 dialog stays: «Загрузить сохранённый» (the guest's progress is lost) or «Отмена»; no merge. | Part 1 §7.6, 0019 #14 |
| 13 | Sign-out and deletion | The device returns to a new local guest; the account's progress stays on the server. | 0040 #3 |
| 14 | The silent server guest | Removed from the client together with its mock (`/auth/guest`, guest device id and refresh). | 0015 |
