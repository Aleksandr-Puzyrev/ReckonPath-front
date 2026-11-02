# 0053. The rest of the account on the backend: plan

Date: 2026-10-30. Asked by: clarify-task (plan level) after task 4 (0052). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Screens with no design (password change, e-mail change, password recovery, devices, consents) | Built from existing parts (form header of 1.3/1.4, fields, buttons, settings rows of 25.x) inside the settings «Аккаунт» group; texts are approved at the start of each task. | 0046 #4 |
| 2 | Libraries | `expo-auth-session` and `expo-crypto` approved for VK ID and Yandex ID (OAuth with PKCE). Captcha is postponed until the backend turns it on (`react-native-webview` would be needed). | rule 06, 0046 #5 |
| 3 | VK ID and Yandex ID keys | Client ids and redirect URIs go to the environment (`.env`), filled in by the developer later; redirect scheme `reckonpath://oauth/vk`, `reckonpath://oauth/yandex`. | 0044 |
| 4 | Yandex button | «Войти с Яндекс ID» under the VK ID button of 1.3/1.4, the same style. | design 1.3, 1.4 |
| 5 | Order | a) password recovery; b) password and e-mail change; c) devices and «sign out everywhere»; d) consents (re-accept on a new version, marketing switch); e) documents; f) VK ID and Yandex ID (sign-in, sign-up, link, unlink). | — |
| 6 | Push tokens | Not in this block; they come with the push task of stage 5. | 0048 #5 |
| 7 | Documents | Opened in the in-app browser (`expo-web-browser`), no in-app PDF viewer. | — |
| 8 | Execution | Sequential, one task at a time, each with its own clarification, review, and report. | rule 18 |

## Task a: password recovery (2026-10-30)

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 9 | Flow | «Забыли пароль?» under the password of sign-in 1.3 (shown now, 0019 #15) → step 1: e-mail (prefilled from sign-in), «Отправить код» → `POST /auth/password/forgot`; step 2: code, new password with the strength bar, «Сохранить пароль» → `POST /auth/password/reset`, resend with a countdown; success → back to sign-in with the e-mail and a toast. Wrong code / too many attempts under the code, a rejected password under the password, others as a toast. | 0019 #15, 0050 #2, #6 |
| 10 | Texts | Approved: `account.forgot.link` «Забыли пароль?» / «Forgot password?»; `account.forgot.eyebrow` «Восстановление» / «Recovery»; `account.forgot.title` «Новый пароль» / «New password»; `account.forgot.emailBody` «Пришлём код на e-mail аккаунта» / «We'll send a code to your account e-mail»; `account.forgot.send` «Отправить код» / «Send the code»; `account.forgot.codeBody` «Если аккаунт с адресом {{email}} есть, мы отправили на него код.» / «If there is an account with {{email}}, we sent a code to it.»; `account.forgot.newPassword` «Новый пароль» / «New password»; `account.forgot.save` «Сохранить пароль» / «Save the password»; `account.forgot.done` «Пароль изменён — войди с новым» / «Password changed — sign in with the new one». The code field and resend reuse `account.code.*`. | — |

## Task b: password and e-mail change (2026-11-01)

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 11 | Flow | Settings «Аккаунт» (account only) gets «Сменить пароль» and «Сменить e-mail», each a modal screen in the sign-in form style. Password: current, new with the strength bar, «Сохранить пароль» → `PUT /me/password`; success closes with «Пароль изменён». E-mail: step 1 new e-mail and current password, «Отправить код» → `POST /me/email`; step 2 code, «Подтвердить» → `POST /me/email/confirm`, resend with a countdown; success closes with «E-mail изменён». Errors: wrong password under the password, taken or same e-mail under the e-mail, wrong code / too many attempts under the code. The current e-mail is not shown (`GET /me` is mocked, 0052 #1). | 0046 #5 |
| 12 | Texts | Approved: `settings.account.changePassword` «Сменить пароль» / «Change password»; `settings.account.changeEmail` «Сменить e-mail» / «Change e-mail»; `account.change.eyebrow` «Безопасность» / «Security»; `account.change.passwordTitle` «Смена пароля» / «Change password»; `account.change.emailTitle` «Смена e-mail» / «Change e-mail»; `account.change.currentPassword` «Текущий пароль» / «Current password»; `account.change.newEmail` «Новый e-mail» / «New e-mail»; `account.change.emailBody` «Пришлём код на новый адрес» / «We'll send a code to the new address»; `account.change.codeBody` «Мы отправили код на {{email}}» / «We sent a code to {{email}}»; `account.change.passwordDone` «Пароль изменён» / «Password changed»; `account.change.emailDone` «E-mail изменён» / «E-mail changed»; `errors.wrong_password` «Неверный пароль» / «Wrong password»; `errors.same_email` «Это и так твой e-mail» / «This is already your e-mail». The account deletion uses `errors.wrong_password` too (supersedes the text of 0052 #2). | 0052 #2 |
| 13 | Icons of the new settings rows (no design) | Both «Сменить пароль» and «Сменить e-mail» use the existing account icon. | 0040 |

## Task c: devices and «sign out everywhere» (2026-11-01)

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 14 | Flow | Settings «Аккаунт» (account only) gets «Устройства» (account icon) → `settings/devices`: each device shows its name (or the platform), «Версия … · Был в сети …»; the current one is marked «Это устройство», the others have «Выйти» (`DELETE /me/devices/{id}`, the row disappears, toast). «Выйти на всех устройствах» at the bottom asks in a dialog, then `POST /auth/logout-all`, the same local cleanup as sign-out, back to settings with a toast. States: loading skeleton, error with retry, offline. | 0040 #3, Part 1 §8.2 |
| 15 | Texts | Approved: `settings.account.devices` «Устройства» / «Devices»; `devices.title` «Устройства» / «Devices»; `devices.current` «Это устройство» / «This device»; `devices.details` «Версия {{version}} · Был в сети {{date}}» / «Version {{version}} · Last seen {{date}}»; `devices.signedOut` «Устройство отключено» / «Device signed out»; `devices.signOutAll` «Выйти на всех устройствах» / «Sign out on all devices»; `devices.signOutAllTitle` «Выйти на всех устройствах?» / «Sign out on all devices?»; `devices.signOutAllBody` «Все сессии завершатся, и на этом устройстве тоже. Войти можно снова с паролем.» / «Every session ends, this one too. You can sign in again with your password.»; `devices.signedOutAll` «Ты вышел на всех устройствах» / «You signed out on all devices». «Выйти» reuses `settings.account.signOut`. | — |
| 16 | Device row data | A device without a model name shows its platform as «iOS», «Android», «Web» (proper names, not translated); a missing app version shows «—». | — |
