# 0015. Guest sign-in and session

Date: 2026-10-02. Asked by: stage 2 task 3 (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Guest session revoked (`SESSION_REVOKED`) | A new guest is created silently. Local progress stays on the device and goes to the new account with attempts sync (task 4); the old guest's server account is lost. Linked accounts keep the Part 7 behaviour (sign-in screen) with task 7. | Part 7 §2, Part 11 ACC-15 |
| 2 | Ban screens (`BANNED`) | A separate later task, together with the arena and a specified appeal form. The design only has the arena ban (28.4). | Part 4 §12.4, design 28.4, Part 11 ACC-14 |
| 3 | `GET /me` | Comes with task 6 (wallet), when the first screen shows its data. | Part 7 §3 |
| 4 | Retrying guest sign-in | On launch, when the network comes back, and on returning to the app while there is no session; network and 5xx errors retried 3 times after 1 / 2 / 4 s; nothing is shown to the player. | Part 4 §2.1, Part 8 §9.1, Part 11 ACC-03 |
| 5 | Device ID | A random UUID v7 created on the first launch and kept in SecureStore (survives a reinstall on iOS through the Keychain). | Part 8 §10.3 |
| 6 | Out of scope | Apple / Google sign-in, linking, `ACCOUNT_CONFLICT` (task 7); sign-out and account deletion; profile and settings screens; App Attest / Play Integrity (`integrityToken` empty, 0014 #6). | Part 12 §2 |
| 7 | Mocks | `/auth/guest` returns a token pair and the guest `Player4821` (Part 7 example); `/auth/refresh` rotates the pair on every call; reusing an old refresh token answers `SESSION_REVOKED`. | Part 7 §3, Part 9 §10 |

## Implementation notes

Date: 2026-10-02. Taken by the agent while implementing, after the code review.

| # | Topic | Decision | Spec reference |
| --- | --- | --- | --- |
| 8 | Which refresh failure starts a new guest | Only `SESSION_REVOKED`. Any other refresh error keeps the saved session and fails the request. The revoked token stays saved until the new guest replaces it, so a sign-in that failed is retried by the next 401. | Part 7 §2 |
| 9 | Access token after a relaunch | Not requested eagerly: the first request that needs it gets a 401 and refreshes (one extra round trip per launch). A request that fails during the first sign-in waits for that sign-in. | Part 8 §9.1 |

## Consequences

`entities/session` holds the session store (access token in memory, refresh token and device ID in SecureStore) and connects it to the HTTP client's 401 refresh; the app layer starts guest sign-in on launch, on reconnect, and on focus.
