# 0016. Attempts sync (outbox)

Date: 2026-10-02. Asked by: stage 2 task 4 (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Reconciling stars with the server | After every successful batch and on launch the client reads `GET /progress`; a level's local stars = the maximum of the server's best and the attempts still waiting in the outbox. This covers a server correction (LVL-27) and a better result on another device (ACC-08). | Part 1 §9.3, Part 7 §4, Part 11 ACC-08, LVL-27 |
| 2 | `contentVersion` | Not sent yet (optional in the contract), with a TODO until content comes from the server (`GET /content/manifest`). | Part 7 §4 |
| 3 | `continueMethod` | The game log keeps the continue method (`ad` / `emeralds`); the dev-only free continue is logged as `ad` until task 6. | Part 7 §4 |
| 4 | Times | `startedAt` is the first tap (`ready → playing`), saved with the game; `finishedAt` is the win or loss; `durationMs` is not sent for the campaign (the attempt timer is daily-only). | Part 6 §4.1 |
| 5 | Rewards and wallet in the response | Not used yet; the balance bar (LVL-26) comes with task 6. | Part 11 LVL-26 |
| 6 | Without a session | The outbox is not sent until the guest is registered; it goes as soon as the session exists (ACC-03). | Part 11 ACC-03 |
| 7 | Dropped attempts | Attempts dropped on a 4xx or with status `rejected` are removed, with a TODO to report them to Sentry once it is set up. | Part 8 §6.4 |
| 8 | Out of scope | Daily attempts and the streak (task 5), the analytics outbox, rewards on the win sheet, restoring progress on a new phone through Apple / Google (task 7). | Part 12 §2 |

Already fixed by the spec: only won / lost attempts go to the outbox; a lost attempt is finished on leaving the lose sheet or on «Заново» after the loss (0010 #20), «Заново» during play starts a new attempt without sending the old one (Part 6 §4.1); batches of up to 50 on launch, on reconnect, on going to the background and every 60 s while not empty; idempotent by `attemptId`; 4xx drops, network / 5xx retries with backoff (Part 8 §6.4).

## Implementation notes

Date: 2026-10-02. Taken by the agent after the code review.

| # | Topic | Decision | Spec reference |
| --- | --- | --- | --- |
| 9 | Finish time | The moment of the win or loss is saved with the game (`finishedAt`), so a lost attempt sent later keeps its real time; a continue clears it. | 0016 #4 |
| 10 | A lost game left on the lose sheet | Opening another level (or the tutorial over it) also finishes the lost attempt and sends it, so it is not lost when the app was closed on the lose sheet. | 0010 #20, Part 6 §4.1 |
| 11 | Statuses that keep a batch | 401, 408, 426, 429 and 5xx keep the batch for a retry; any other non-2xx drops it. | Part 8 §6.4 |

## Round 2

Date: 2026-10-02. Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 12 | Local wins recorded before the outbox existed | **Accepted to be lost.** They were never sent and have no attempts, so the first reconciliation replaces them with the server's stars. The app is not released, so only test devices are affected; keeping higher local stars would stop server corrections (LVL-27) from lowering them. | Part 1 §9.3, Part 11 LVL-27 |

## Consequences

`useOutboxStore` (MMKV, versioned) holds finished attempts; the game log gains `startedAt` and the continue method; the progress store merges `GET /progress` by maximum with pending attempts.
