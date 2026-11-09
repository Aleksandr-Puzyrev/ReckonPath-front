# 0059. Nickname change

Date: 2026-11-09. Asked by: clarify-task for the nickname change (design 23.4, Part 4 §10.2, ACC-12) after the bb3f885 backend audit. Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Sheet or screen | A separate screen as in design 23.4 («‹ Профиль», title «Ник»), opened by a tap on the nickname in the profile header. Signed-in players only: a guest has no nickname (0050 #9). | Part 4 §10.1–10.2, design 23.4 |
| 2 | Allowed characters (A7) | Latin letters, digits and `_`, 3–16, the same as the backend (`^[A-Za-z0-9_]{3,16}$`). The sign-up form follows the same rule. | Part 5 `nick.rules`, 0019 #18 |
| 3 | Live check | Live only for length and characters. «Уже занято» appears under the field after `409 nick_taken` on save. «Недопустимое слово» is not shown until the backend has a stop list. The availability check and the stop list go to the backend backlog. | Part 4 §10.2, Part 5 `nick.*` |
| 4 | Paid change | No confirmation dialog: the price is in the note and «Сохранить» saves. `not_enough_gems` opens the same emerald shortfall sheet as the shop and the continue. | Part 1 §8.2, design 23.4 |
| 5 | Note under the field | `nicknameChange.price` 0 → «Первая смена бесплатна» / "Your first change is free". Price above 0 → «◆ {{price}}, следующую смену можно будет сделать не сразу» without the number of days (the backend does not send `nick_cooldown_days`; it goes to the backlog). `availableAt` in the future → the button is disabled and the note reads «Следующая смена — {{date}}» / "Next change on {{date}}". A `nick_change_cooldown` refusal (the profile was stale) refreshes `/me`, which brings that note; no separate text. | Part 4 §10.2, ACC-12 |
| 6 | Other texts | «Минимум 3 символа» / "At least 3 characters" (design), `nick.invalid` for characters, `nick.rules` as the hint under the field, «✓ Подходит» / "✓ Looks good" for a valid new nickname (availability is unknown before saving), toast «Ник изменён» / "Nickname changed". The demo hint of the design («Попробуй „kira“…») is not used. | Part 5 `nick.*`, design 23.4 |
| 7 | After saving | The toast, back to the profile; `/me` is set from the `PATCH /me` response. | — |
| 8 | Errors and offline | Other errors and no network: a toast with the error text by code; the nickname stays in the field. The button is disabled while the nickname is unchanged or invalid. | Part 1 §8.2 |
| 9 | Scope | Not in this task: achievements, statistics, another player's profile, avatar choice, the availability check and stop list on the client. | 0020 #5 |

## Consequences

* `PATCH /me` with `nickname` goes to the backend (already in `BACKEND_ROUTES` since 0058); the contract gains `nick_change_cooldown` and the request field `nickname`.
* Part 1 §7.1 («буквы RU/EN») and Part 5 `nick.rules` («буквы») read as Latin letters (#2); the text of `nick.rules` stays as in Part 5.
* The backend backlog gets: a nickname availability check, a stop list, `nick_cooldown_days` in `/bootstrap`.
