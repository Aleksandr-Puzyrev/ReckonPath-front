# 0052. Profile on the backend (backend task 4)

Date: 2026-10-29. Asked by: clarify-task, backend connection task 4 (0048 #5). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | `GET /me` lacks wallet, level, XP, arena, loadout, and flags | `GET /me` stays on the mocks until the backend adds the fields (listed in the handoff); only what does not depend on them is connected now. | 0048 #1, #6 |
| 2 | Account deletion | Confirmation by password instead of the nickname (design 26.3, 0040 #3). After deletion the app becomes a guest and shows «Аккаунт будет удалён {{date}}» with the backend's `purge_after`; no «deletion scheduled» screen with «Отменить» until the backend can restore. Texts approved: `settings.delete.passwordLabel` «Пароль от аккаунта» / «Account password»; `settings.delete.passwordHint` «Введи пароль, чтобы подтвердить удаление» / «Enter your password to confirm»; `settings.delete.scheduledToast` «Аккаунт будет удалён {{date}}» / «Your account will be deleted on {{date}}». A wrong password (`wrong_password`) shows under the field with the existing «Неверный логин или пароль». | 0040 #3, #15, Part 1 §7.6 |
| 3 | Language of an account | Changed on the device only until the backend stores the locale (it rejects `PATCH /me {locale}`). | 0040 #9 |
| 4 | Wallet | Stays in the mocked `/me`; `GET /wallet` (`gems` → emeralds) is connected together with `/me`. | P3 |
| 5 | Backend routes | `DELETE /me` only. | 0048 #1 |

## Consequences

* The deletion toast reuses the existing key `settings.delete.scheduledTitle` (RU «Аккаунт будет удалён {{date}}», the same as the approved text; EN «Account will be deleted on {{date}}», approved in 0040) instead of a new `settings.delete.scheduledToast`.
* Spec Part 7 still describes `DELETE /me {confirmNickname}` → `{deletionScheduledAt}`; this decision overrides it.
