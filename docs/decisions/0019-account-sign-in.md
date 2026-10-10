# 0019. Account: login and password instead of Apple / Google

Date: 2026-10-09. Asked by: stage 2 task 7 (clarify-task). Answered by: developer.

Supersedes the Apple / Google sign-in of Part 1 §7.6, Part 4 §12.1 and §12.3, Part 7 §3 (`/auth/apple`, `/auth/google`, `/auth/link`) and Part 8 §10.3, and the stage 2 task 7 wording of 0014 #4.

## Round 1

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Sign-in providers | **No Apple and no Google.** Sign-in is by login and password; VK ID comes later, with endpoints from the backend. `expo-apple-authentication` and `@react-native-google-signin/google-signin` are not installed. | Part 1 §7.6, Part 8 §2, §10.3 |
| 2 | Account conflict | The two progress cards of design 26.2, with the spec's choice: «Загрузить сохранённый» (with the design's confirmation; the guest progress is lost) or «Отмена» (nothing changes). Keeping the guest and dropping the saved account is not offered. | Part 1 §7.6, Part 11 ACC-06, design 26.2 |
| 3 | Conflict card data | Level, ★, league (`—` for a player without the arena). «Это устройство»: level from `GET /me`, ★ from the local progress. | Part 7 §3, design 26.2 |
| 4 | Where the link sheet opens | Now only after campaign level 6. The other entry points (before the first arena match, before the first ◆ purchase, adding friends) and the profile card «Сохрани прогресс» and the settings «Аккаунт» group come with those screens. | Part 1 §7.6, Part 4 §10.1, §12.1 |
| 5 | When after level 6, and after «Позже» | Once, after the level 6 win sheet closes, in the pop-up queue after it. After «Позже» it does not open by itself again. | Part 1 §7.6, §8.2 |
| 6 | Local data after «Загрузить сохранённый» | The guest's local progress, unsent attempts and daily record are cleared, then the account's data is loaded from the server (no merge by maximum with the guest). | Part 1 §7.6, 0016 |
| 7 | `SESSION_REVOKED` for an account with a login | A new guest is created silently, as for a guest (0015 #1); the player signs in again through the link sheet (see #16). | Part 7 §2, Part 11 ACC-15 |
| 8 | Texts | From design 26.1, 26.2, 1.3 and 1.4 (RU / EN), including the toast «Аккаунт привязан» / "Account linked". Part 5 has only `profile.saveProgress`. | Part 5, design |
| 9 | Cancel and errors | No network — toast «Нет связи с сервером»; other errors — the generic toast. | Part 7 §2 |
| 10 | Mocks | Registration succeeds; login answers with the saved account `Nova_58` (level 58, GOLD I, 512 ★); the login `kira` is a taken nickname for registration; the password `000000` is wrong (design 1.3, 1.4). | — |
| 11 | Out of scope | Sign-out, account deletion, the profile and settings screens, bans, VK ID, password recovery; keeping the unchosen profile for 30 days is the server's job (E2-2). | Part 12 E2-2 |

## Round 2

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 12 | Where sign-in starts | The guest is still created silently (0015, E2-1). The sign-in (design 1.3) and sign-up (1.4) forms open from the link sheet 26.1. The sign-in choice screen 1.2 is not built. | Part 12 E2-1, design 1.2–1.4 |
| 13 | Link sheet 26.1 | Three benefits, «Зарегистрироваться» (primary: the guest becomes a permanent account), «Войти» (existing account), «Позже». No VK ID button until the backend provides its endpoints. | Part 4 §12.3, design 26.1 |
| 14 | Contract (**to agree with the backend**, not in Part 7) | `POST /auth/register` `{ nickname, email, password }` in the guest's session turns the guest into a permanent account → `200 { user }`; errors `NICK_TAKEN`, `EMAIL_TAKEN` (new), `VALIDATION`. `POST /auth/login` `{ login, password }` (`login` is a nickname or e-mail) → token pair, `user` and `summary { level, league, stars }`; error `INVALID_CREDENTIALS` (new). The conflict is decided on the client: when the guest has local progress, dialog 26.2 is shown with the summary; «Загрузить сохранённый» applies the new tokens, «Отмена» revokes them with `POST /auth/logout` and keeps the guest. | Part 7 §2–§3 |
| 15 | «Забыли пароль?» | Not shown until a separate task (no screen and no endpoint). | design 1.3 |
| 16 | Missing texts | `EMAIL_TAKEN`: «Этот e-mail уже занят» / "This e-mail is already taken". «условия» and «политика конфиденциальности» in the 1.4 consent are plain text with a TODO until their URLs exist. | design 1.4 |
| 17 | Signing in again after `SESSION_REVOKED` | For an account that had a login, the link sheet 26.1 opens once after the new guest is created. | Part 11 ACC-15 |

## Implementation assumptions (accepted by the developer)

| # | Topic | Decision | Source |
| --- | --- | --- | --- |
| 18 | Form validation | Sign-in: login not empty, password at least 6 characters. Sign-up: nickname 3–16 letters, digits and `_`; e-mail format; password at least 8 characters with strength at least «Средний» (four signs of design 1.4); consent required. The nickname stop list is checked by the server. | design 1.3, 1.4, Part 4 §10.2 |
| 19 | Navigation and results | The forms are full-screen modal routes opened from the link sheet. After sign-up — toast «Аккаунт привязан» and back to where the sheet was opened; after sign-in — Home with the loaded progress. The design's success screens («Аккаунт создан! К обучению →», «Готово, ты в игре») belong to the first launch and are not built. | design 1.3, 1.4 |
| 20 | Password on the device | Never stored; only the tokens, as now. | Part 8 §10.3 |
| 21 | VK ID | A separate task once the backend gives the endpoints; its SDK is not in the Part 8 stack and needs the developer's approval. **Not planned for now (0025): login and password only.** | — |

## Round 3

Date: 2026-10-09. Answered by: developer (after the code review).

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 27 | Description on the conflict screen | «У этого аккаунта уже есть прогресс. Если загрузить его, прогресс на этом устройстве удалится.» / "This account already has progress. If you load it, the progress on this device is deleted." Replaces the open point of #24. | design 26.2 |
| 28 | When a queued link offer shows (refines #5) | Only on the tab screens, never over a game; it also waits while the soft update sheet is open (technical windows come first). | Part 1 §8.2 |
| 29 | Implementation notes #22–26 | Accepted. | — |

## Implementation notes

Date: 2026-10-09. Taken by the agent while implementing; to be confirmed by the developer.

| # | Topic | Decision | Source |
| --- | --- | --- | --- |
| 22 | HTTP statuses (**to agree with the backend**) | `NICK_TAKEN` and `EMAIL_TAKEN` — 409 (as `NICK_TAKEN` in Part 7 §2); `INVALID_CREDENTIALS` — 422, because the client refreshes the session on any 401. | Part 7 §2, Part 8 §9.1 |
| 23 | Sizes from the design | Field height 52 and border 1.5, consent box 24, strength bar 4, link badge 96 / radius 30 / icon 44 (design 1.3, 1.4, 26.1); Part 3 §4.5 has no input size. Strength colours map to `status.danger`, `feedback.warm`, `status.warning`, `status.success`. | design 1.3, 1.4, 26.1 |
| 24 | Conflict screen | A full screen in place of the sign-in form, as in design 26.2. The description is #27. No avatars on the cards (no avatar data yet). The «или» divider of 1.3 / 1.4 is not shown without the VK ID button. | design 26.2 |
| 25 | EN for «Загрузить сохранённый» | "Load saved" (Part 1 gives only RU). | Part 1 §7.6 |
| 26 | Libraries | `@hookform/resolvers` and `react-native-keyboard-controller` (Part 8 §2) installed with `react-hook-form`; the keyboard controller has native code, so the dev build must be rebuilt. | Part 8 §2, rule 12 |

## Consequences

Task 7 builds the link sheet, the sign-in and sign-up forms (`react-hook-form` + zod; `react-hook-form` is installed with this task), the conflict dialog, the `/auth/register` and `/auth/login` contract in `contracts/openapi.yaml` with mocks, and the level 6 and revoked-session entry points.
