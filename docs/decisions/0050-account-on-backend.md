# 0050. Account on the backend: local guest, sign-in and sign-up (backend task 3a)

Date: 2026-10-25. Asked by: clarify-task, backend connection task 3 (0048 #5). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Split | 3a — the account: the silent server guest gives way to the local guest; sign-in, sign-up with the email code, refresh, and sign-out in the backend's format. 3b — what the guest sees (wallet, arena, purchases, continue for emeralds, ad rewards, streak and daily calendar) — its own round. | 0048 #8–#14 |
| 2 | Email code screen (not in the design) | Built from existing parts: the form header of 1.3/1.4, a 6-digit field, «Подтвердить», «Отправить код ещё раз» with a countdown from `resend_after`. It also opens when sign-in answers `email_not_verified` (the code is sent again). Texts approved: `account.code.title` «Подтверди e-mail» / «Confirm your e-mail»; `account.code.body` «Мы отправили код на {{email}}. Если этот адрес уже зарегистрирован, в письме будет ссылка на вход.» / «We sent a code to {{email}}. If this address is already registered, the e-mail has a sign-in link instead.»; `account.code.label` «Код из письма» / «Code from the e-mail»; `account.code.submit` «Подтвердить» / «Confirm»; `account.code.resend` «Отправить код ещё раз» / «Send the code again»; `account.code.resendIn` «Отправить ещё раз через {{time}}» / «Send again in {{time}}»; `errors.invalid_code` «Неверный код» / «Wrong code»; `errors.too_many_attempts` «Слишком много попыток. Запроси новый код» / «Too many attempts. Request a new code». | 0046 #4 |
| 3 | Sign-in identifier | E-mail only (the backend takes no nickname): the «Ник или e-mail» field of design 1.3 becomes «E-mail» with a format check. | 0019 #14, design 1.3 |
| 4 | Conflict on sign-in | Until the backend has `/progress`, sign-in keeps the guest's progress on the device and shows no dialog; the 0019 #14 dialog returns once the endpoint exists. | 0048 #12 |
| 5 | Consents | The single checkbox of design 1.4 sends `accept_terms` and `accept_privacy`; a second, optional checkbox «Хочу получать новости и подарки на e-mail» / «Send me news and gifts by e-mail» sends `accept_marketing`. | 0046 #5 |
| 6 | Server password rejection | Any `validation_failed` on the password field shows `account.errors.passwordRejected` «Пароль слишком простой — придумай другой» / «This password is too easy — choose another». | 0019 #18 |
| 7 | `device` object | The persistent install id (as now), the platform, the model from `expo-device`, the app version. | — |
| 8 | Sign-out and revoked session | Sign-out: `POST /auth/logout` with the current token, then a new local guest. A revoked session turns into the local guest with the «sign in again» offer (0019 #17). | 0040 #3, 0019 #17 |
| 9 | Guest or account | The local account flag decides, instead of `isGuest` from `/me`. | — |
| 10 | Later, separate tasks | «Забыли пароль?», VK ID and Yandex ID, captcha. | 0019 #15, 0046 #5 |
| 11 | Backend routes | `/auth/register`, `/auth/register/verify`, `/auth/register/resend`, `/auth/login`, `/auth/refresh`, `/auth/logout`. | 0048 #1 |

## Consequences

* The account conflict UI of design 26.2 (`account-conflict`, `conflict-card`, `load-saved-account`, `progress-card`, `use-device-summary`) is removed with #4; restore it from commit `6e99a3c` once the backend has `/progress`.
* `/auth/guest`, `LoginResult`, `AccountSummary`, `Session`, and `SessionUser` are gone from `contracts/openapi.yaml`; the auth endpoints follow the backend's shape.
* The profile decides «гость» by the local account flag (#9).
