# 0067. Events and achievements API

Date: 2026-11-25. Asked by: client integration audit. Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Which API should the client use for events? | Use the competitive event API in backend `283c87e` as the basis for integration. Its flow uses event codes, a leaderboard and prizes by place. | Part 1 §7.3, Part 4 §11.1, Part 7 §7, 0065 #4, E1 |
| 2 | Which API should the client use for achievements? | Use the achievement list and reward claim API in backend `283c87e` as the basis for integration. | Part 4 §10.1 item 5, 0065 #4, E2 |
| 3 | Where do players find and play events? | The home screen links to the event list with code entry. Event details offer joining, maps, standings and prizes by place. Winners claim prizes on that page after the event ends. Use design 27 and the existing arena leaderboard as visual references. | Part 4 §11.1, design 27 |
| 4 | How should achievements appear in the profile? | Show conditions, progress and the claim action for eligible rewards. Defer selection of three displayed badges. | Part 4 §10.1 item 5, design 23.5 |
