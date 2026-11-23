# 0065. Backend re-sync to 283c87e

Date: 2026-11-23. Asked by: check-backend re-audit of backend `a709480` → `283c87e` (`docs/backend-discrepancies.md` K42, K43, R40, E1, E2). Answered by: developer.

The rule of 0060 holds: where the backend and the spec or earlier decisions differ, the client follows the backend.

| # | Question | Decision | Supersedes |
| --- | --- | --- | --- |
| 1 | Reveal after «Не продолжать» (K42) | No reveal: the give-up result has no `secrets`, the hidden targets, bombs and buoys stay hidden after a loss. The board still draws `result.secrets` whenever the server sends them (a win). | Part 4 §6.2 п.4, Part 3 §8.2 «Поражение» (translucent targets after declining) |
| 2 | Repeat win (K43) | A repeat win without a star improvement gives nothing: no ● 5, no XP. XP 10 only for the first win; an improvement pays the difference. The win sheet shows what the server sends. | Part 1 §3.6 (repeat win ● 5), Part 6 §5.5 (XP 2 for a repeat win) |
| 3 | Surrender at 0 (R40) | The side that surrenders with score 0 gets no XP (and no RP, R17). | Part 6 §5.5 («матч 5» XP for every match) |
| 4 | Events and achievements (E1, E2) | Decided when those sections are taken up, with design for join by code, the leaderboard and prizes by place. | — |

## Consequences

* The campaign mock's give-up returns no `secrets`, and a repeat win in the mock pays nothing; the tests follow.
* K42, K43 and R40 in `docs/backend-discrepancies.md` are closed by this decision; E1 and E2 stay open.
