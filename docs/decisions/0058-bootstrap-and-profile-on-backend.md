# 0058. Bootstrap, full profile and account restore on the backend

Date: 2026-11-09. Asked by: clarify-task after the bb3f885 backend audit (`docs/backend-discrepancies.md`). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Scope | Client fixes from the audit (`price_changed` price object S13, `/maintenance` shape C9, `version` dropped from `Bootstrap` C11) and `GET /bootstrap`, `GET /me`, `PATCH /me`, `POST /me/restore` move to `BACKEND_ROUTES`. Not in this task: the nickname change screen (design 23.4, ACC-12, A7), `/continue`, the arena. Error codes are added only with their task: here `not_scheduled`, `idempotency_in_progress`, `invalid_idempotency_key`. | 0048 #1 |
| 2 | Account deletion | The backend keeps the session after `DELETE /me`, so the 0040 #15 flow returns: the player stays signed in, sees the screen with the date and «Отменить удаление» (`POST /me/restore`); the settings row shows «Удаление {{date}}». Supersedes 0052 #2 (the device no longer turns into a guest). Sign-in cancelling deletion (ACC-10) is the backend's (P10). | Part 1 §7.6, 0040 #15 |
| 3 | Arena data in `GET /me` while the arena is mocked | Taken from `/me` as is (home and profile trophies, league); the mismatch with the mocked arena screens is dev-only until the arena is connected. The division string («III», «II», «I») maps to a number. | 0048 #1 |
| 4 | `arena.maxTurns` from `/bootstrap` | Ignored while the arena is on the mocks: the engine default is used (the backend's 60 for both players contradicts the spec, R9). | Part 6, R9 |
| 5 | Game day | The client keeps its own UTC day key; `day_key` and `next_day_at` from `/bootstrap` are not used until the backend fixes C10. | Part 1 §4.1, 0007 #15 |
| 6 | Other bootstrap config | Interstitial values come from the server (remote config). An empty `ads_network` means ads are off. | 0027 |
| 7 | Account language | `PATCH /me {locale}` after sign-in and on a language change. Supersedes 0052 #3. | 0040 #9 |
| 8 | Country (P21) | Not sent in this task; comes with the leaderboards (stage 5). | Part 7 §5 |
| 9 | Bans | The ban screen still opens on a `403 banned` response; `flags.bans[]` from `GET /me` is not used (G21). | 0038 |
| 10 | New error codes | `idempotency_in_progress`: one retry with the same key after `Retry-After`. `not_scheduled` on restore counts as success (the profile is refreshed). | Part 7 §1 |
| 11 | Maintenance (C9) | `/maintenance` is read as `null` or `{until, message}`; the end time is shown the same way as for a 503 `maintenance`. Supersedes 0049 #4. | Part 7 §3 |
| 12 | Level and XP | Shown as the server sends them, though the backend curve differs from Part 6 §5.5 (P22, the backend's fix). | Part 6 §5.5 |
| 13 | `Me` fields the backend lacks | `isGuest` — the local flag (0050 #9); `friendCode` — friends, stage 5; `arena.peak`, `rp`, `seasonId` are not sent: if the implementation finds a consumer, it stops and asks. | Part 7 §3 |

## Consequences

* `contracts/openapi.yaml`: `Me` follows the backend's `GET /me` shape (camelCase on the client side), `Bootstrap` drops the required `version`, `ErrorCode` gains the three codes of #1.
* Decision 0052 #2 and #3, and 0049 #4, are superseded.
