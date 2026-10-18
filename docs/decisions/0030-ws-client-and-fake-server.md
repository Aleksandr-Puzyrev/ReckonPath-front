# 0030. WebSocket client and fake game server

Date: 2026-10-17. Asked by: stage 4 task 2 (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Opponent in the fake server | After 3–8 s the fake «finds a player» (`isBot: false`, a mock nickname) played by the engine solver. A fake option «no opponent» gives the bot after 20 s (PVP-31); tests and dev builds switch it by an override, like `mockServer.use`. | Part 1 §5.3, Part 11 PVP-31 |
| 2 | Match results in the mocks | The fake records every result now: trophies, league and W/L/D in `GET /arena` (engine `trophyDelta`, `applyTrophies`, `rankPoints`), a row in `GET /arena/matches` and its details, ● 40 and ◆ 3 into the mock wallet. Supersedes the «history mock with task 3» part of 0029 #7. | Part 1 §5.8, Part 6 §5 |
| 3 | `shared/ws` scope | Everything of Part 8 §9.2 and Part 7 §8.1: two connections (common entry and match node), `ping` every 5 s and reconnect after 10 s without `pong`, backoff 0.5 → 1 → 2 → 4 s with jitter up to 30 s in a match, then `?resume=1` and `match.resync`; clock offset as the median of 5 pings; `seq` order with `match.resync` on a gap; zod validation, invalid messages ignored (Sentry as a `TODO` until it is set up); background closes after 5 s in a match, at once otherwise, and reconnects on `active`; API `ws.on(type, handler)`, `ws.send(type, payload)`. | Part 8 §9.2, Part 7 §8.1 |
| 4 | Close codes | `shared/ws` handles 4001 (refresh the token and reconnect) and 4010 (reconnect to the node in `reason`); 4003, 4009, 4026, 4503 go to subscribers, screens react in tasks 5 and 10. | Part 7 §8.1 |
| 5 | `matchStore` | Not in task 2: the Part 8 §6.3 state machine comes with search and match (tasks 5–6). | Part 8 §6.3 |
| 6 | Maps | The player's map is the mock active map (no active map → `queue.join` error); the opponent's map comes from `generateRandomPvpMap`; the opponent's targets and bombs reach the client only in `match.end` (PVP-28). | Part 1 §5.3, PVP-28 |
| 7 | Bot | Engine solver moves; a random candidate with probability 40% in Bronze; thinking 1.2–4 s, a timeout on 2% of turns; the bot sends no emotes. The server keeps the 5 s emote cooldown (PVP-27) and echoes emotes. | Part 1 §5.6, PVP-27 |
| 8 | Match rules | A port of `simulate-match` (Part 6 §4.2): taps, bombs and skips, timeout + 300 ms with `STALE_TURN`, AFK after 3 timeouts, final turn, 40-turn limit, surrender; errors `NOT_YOUR_TURN`, `CELL_REVEALED`, `CELL_ROCK`, `MATCH_OVER`. The fake opponent never disconnects; drops (PVP-16, NET-11) are tested through a controllable transport, no dev menu. | Part 6 §4.2, PVP-01…15 |
| 9 | Training match | Not in task 2 (rules clarified with onboarding, task 9); the fake supports `ranked` and the bot. | Part 1 §5.12 |
| 10 | Nicknames | Mock pools from the design and spec nicknames; bots use a separate pool. | Part 1 §5.6 |
| 11 | Out of task 2 | Search, VS and match screens; async match (only `queue.status.asyncAvailable` turns true after `asyncAfterSec` = 10 s); friend challenges and presence (stage 5). | 0028 #5, #6 |

## Consequences

`shared/ws` gets the client with a transport interface; the fake game server lives next to the REST mocks (`src/shared/api/mocks`, may use the engine by 0029 #10) and is dropped from release builds with the `__DEV__` branch. Tests cover the WS client mechanics and PVP-01…15, 27–31 on the fake server.

## Implementation notes

* The WebSocket origin comes from `EXPO_PUBLIC_WS_URL`; empty in a dev build → the fake server (as `EXPO_PUBLIC_API_URL` for REST).
* Reconnect jitter is up to +20% of the delay. A missing access token is reported to subscribers as 4001 without connecting.
* A `match.tap` gets an `ack` and then `match.tapResult`; a timed-out turn is reported in the next `match.turn` as `skipped: [{ player, reason: "timeout" }]`.
* The intro lasts 3 s (the VS screen of Part 1 §5.3) and starts when the client connects to the match node.
* The engine also exports `LEAGUES` (division ranges and the season floor of PVP-24 in the mock profile); `PVP_SOLVER_BOMB_PENALTY` is exported since 0029 #11.
* On 4001 the client refreshes the token once per drop; a failed refresh or a second 4001 before a working pong goes to subscribers as 4001. A `seq` gap sends one `match.resync` until the snapshot arrives.
* The fake has test options `configure({ hasOpponent, opponentMap, first })`; the mock format stays Bronze whatever the trophies.
* `match-rules` replays all engine match vectors (`packages/engine/vectors/match.json`).
