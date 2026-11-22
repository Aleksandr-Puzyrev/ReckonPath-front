# 0062. Friends on the backend

Date: 2026-11-17. Asked by: clarify-task for friends (Part 1 §7.2, Part 4 §10.4–10.5, design 23.1, 24.1–24.6, FRN-01…11) against backend `a709480` (`internal/features/friends`, `internal/features/arena/challenge.go`). Answered by: developer.

The rule of 0060 holds: where the backend and the spec, design or earlier decisions differ, the client follows the backend.

| # | Question | Decision | Supersedes |
| --- | --- | --- | --- |
| 1 | Scope | Two MRs. MR 1: the friends list, requests, search, the invite code, the «Друзья» tab of the daily top, the profile row «Друзья · N · M онлайн» and the Profile tab dot. MR 2: friend challenges (24.4–24.6). | 0028 #5, 0030 #11, 0041 #10 (stage 5 timing) |
| 2 | «Мой код» | The backend's invite code (`GET /me/invite`): redeemed once (`POST /me/invite`), only within `invite_days` of sign-up, and makes the players friends at once. A separate code field is shown while it can be redeemed. Search is by nickname only. A permanent friend code goes to the backend to-do. | Part 1 §7.2 friend code, Part 7 `friendCode`, 0058 #13 |
| 3 | «Пригласить по ссылке» | Shares the code text through the system Share; no link. An https invite link goes to the backend to-do. | Part 1 §7.2 invite link |
| 4 | Invite reward | The backend's: only the inviter gets ◆ `reward_gems` after the friend's first arena match, up to `limit`. One line `friends.inviteReward`. | Part 1 §7.2 (both get ◆ 20, max 10) |
| 5 | Challenge format (MR 2) | No picker: the sheet shows the player's league format, «дружеский матч — кубки не меняются» and «Отправить вызов»; the map is chosen in the usual prepare phase. A league list goes to the backend to-do. | Part 4 §10.5, design 24.4 |
| 6 | Who can be challenged (MR 2) | Every friend except one `in_match`; the status is shown as the backend sends it. | Part 4 §10.4 item 3 («Вызвать» only online) |
| 7 | Incoming challenges (MR 2) | The arena socket stays open app-wide while signed in; the banner is hidden during a game or a match; no auto-decline «занят» — the challenge expires on the server. | Part 4 §10.5 (auto-decline) |
| 8 | Last seen | «Не в сети» without a time; last seen goes to the backend to-do. | Part 5 `friends.status.lastSeen` |
| 9 | Outgoing requests | A «Отправленные» section at the bottom of the Requests tab with «Отозвать». | design 24.1 (not shown) |
| 10 | Remove a friend | «⋯» on the friend row → «Удалить из друзей» with a confirmation. Block, report and the blocked list come with another player's profile. | — |
| 11 | Search | From 3 characters (the backend rule), debounced; «Никого не нашли» when empty; the row button follows `relation`: «Добавить» / «Отправлено ✓» / «Принять» / «В друзьях». | design 24.2 (from 2 characters, nickname or code) |
| 12 | Daily top | Tabs «Все / Друзья»; «Страна» hidden (0060 #16). Outside the friends list my row has no rank. | Part 4 §7 item 5 (third tab) |
| 13 | Profile tab dot | From `counts.incoming`; refreshed on app focus and on opening Profile or Friends. | — |
| 14 | Offline | Cached data with the «Нет сети» bar; actions disabled. | — |
| 15 | Out of scope | Push and the settings channels, the Home challenge block (19.1), another player's profile, «Добавить в друзья» on the match result, arena and weekly leaderboards, the `features.friends` flag. | — |
| 16 | Route | `/friends`. | — |
| 18 | Follow-up texts (after review) | The share button reads `friends.invite` «Поделиться кодом» / "Share code" (it shares the code, not a link). The empty Requests tab shows `friends.noRequests` «Заявок пока нет» / "No requests yet". An accepted code whose inviter did not become a friend shows the toast `friends.redeemAccepted` «Код принят» / "Code accepted". | Part 5 `friends.invite` text |
| 17 | New texts | Texts of Part 5 §5 and the design are used as written. New (RU / EN): `friends.searchHint` «Введите хотя бы 3 символа ника» / "Type at least 3 characters of the nickname"; `friends.noResults` «Никого не нашли» / "No one found"; `friends.outgoing` «Отправленные» / "Sent"; `friends.withdraw` «Отозвать» / "Withdraw"; `friends.isFriend` «В друзьях» / "Friends"; `friends.remove` «Удалить из друзей» / "Remove from friends"; `friends.removeConfirm` «Удалить {{name}} из друзей?» / "Remove {{name}} from friends?"; `friends.redeem` «Код приглашения» / "Invite code"; `friends.redeemDone` «Код принят — {{name}} теперь в друзьях» / "Code accepted — {{name}} is now your friend"; `friends.inviteReward` «Друг сыграет первый матч на арене — тебе ◆ {{gems}}» / "When your friend plays their first arena match, you get ◆ {{gems}}"; `friends.offline` «Не в сети» / "Offline"; `errors.already_friends` «Вы уже друзья» / "You’re already friends"; `errors.request_exists` «Заявка уже отправлена» / "Request already sent"; `errors.requests_limit` «Слишком много отправленных заявок (до 50)» / "Too many sent requests (up to 50)"; `errors.request_not_found` «Заявка уже неактуальна» / "This request is no longer active"; `errors.not_friends` «Этот игрок уже не в друзьях» / "This player is no longer your friend"; `errors.user_not_found` «Игрок не найден» / "Player not found"; `errors.invite_invalid` «Такого кода нет» / "No such code"; `errors.invite_used` «Код приглашения уже введён» / "An invite code has already been used"; `errors.invite_expired` «Код можно ввести только в первые 7 дней» / "The code can only be entered in your first 7 days"; `errors.invite_self` «Это твой собственный код» / "That’s your own code". | — |

## Consequences

* `contracts/openapi.yaml` gets the backend's friends and invite paths (MR 1) and challenge paths (MR 2) with their error codes.
* `docs/backend-handoff/backend-todo.md` gets: a permanent friend code, an https invite link, last seen, app-wide presence, a league list for the challenge format.
* `POST /me/invite` returns no data: after it the client refetches `GET /me/invite` (`invited_by` id) and `GET /friends` and takes the name for `friends.redeemDone` from the friend with that id.

## Round 2: friend challenges (MR 2)

Date: 2026-11-17. Asked by: clarify-task for challenges (Part 4 §10.5, Part 5 §5, FRN-07…10, design 24.4–24.6) against backend `a709480` (`internal/features/arena/challenge.go`). Answered by: developer.

| # | Question | Decision | Supersedes |
| --- | --- | --- | --- |
| 19 | Decline and timeout for the challenger | `declined` → toast `friends.challenge.cantNow`; `expired` → toast `friends.challenge.noAnswer` «Нет ответа от {{name}}». | Part 5 `friends.challenge.noAnswer` («Друг не ответил»), Part 4 §10.5 (one text) |
| 20 | Waiting screen | Modal: back, the gesture and «Отменить» cancel the challenge (`DELETE /arena/challenges/{id}`). On `accepted` the challenger goes to the match from the `match` push. | — |
| 21 | Friendly result | No trophies, league progress or rewards; the line `result.pvp.friendly`; «В арену» → `result.pvp.back`; no «Ещё бой» or re-challenge. | — |
| 22 | Locked or banned arena | «Вызвать» is disabled and a tap shows the reason toast; the incoming banner is not shown to such a player; the arena socket is not opened for an arena-banned player. | — |
| 23 | Banner | Design 24.6: «{name} вызывает на дуэль» and `friends.challenge.incomingSub`; a bar by `expires_at`; the newest pending challenge first, the next one after it closes. Hidden on `play/*`, `editor/tryout`, the arena match, search and onboarding; shown on the arena result. | Part 5 one-line `friends.challenge.incoming` |
| 24 | Challenge sheet | «Вызов · {name}», `friends.challenge.friendly`, the league format line `arena.format`, «Отправить вызов». | design 24.4 format and map pickers (#5) |
| 25 | Friendly surrender and history | Surrender confirm `match.surrender.confirmFriendly`; history row `history.friendly` instead of «0». The ad interstitial counts a friendly match like any other. | — |
| 26 | Receiver's decline | Toast `friends.challenge.declined`; a cancelled or expired challenge just hides the banner. | — |
| 27 | Key clash | `friends.challenge` («Вызвать») becomes `friends.challenge.action`: i18next cannot hold a string and a namespace under one key. | Part 5 key name |
| 28 | Texts | Design texts as written: `friends.challenge.title`, `friendly`, `send`, `waiting`, `waitingSub`, `cantNow`, `incomingSub`, `declined`. New (RU / EN): `friends.challenge.noAnswer` «Нет ответа от {{name}}» / "No answer from {{name}}"; `errors.rival_busy` «Друг сейчас в матче — попробуй позже» / "Your friend is in a match — try later"; `errors.challenge_not_found` «Вызов уже неактуален» / "This challenge is no longer active"; `errors.season_changing` «Сезон сменяется. Попробуй через пару минут» / "The season is changing. Try again in a couple of minutes"; `errors.arena_locked` «Арена откроется после уровня {{level}}» / "The Arena unlocks after level {{level}}"; `errors.arena_banned` «Арена для тебя закрыта» / "The Arena is closed for you"; `errors.match_in_progress` «Сначала доиграй текущий матч» / "Finish your current match first"; `result.pvp.friendly` «Дружеский матч — кубки не изменились» / "Friendly match — trophies unchanged"; `result.pvp.back` «Назад» / "Back"; `match.surrender.confirmFriendly` «Сдаться? Кубки не изменятся» / "Give up? Trophies won’t change"; `history.friendly` «дружеский» / "friendly". | — |

### Consequences of round 2

* The backend to-do gets: events for silent cancels (a new challenge, unfriend, block), a way to read an accepted challenge's `match_id`, swagger `in_match` → `match_in_progress`; the app-wide presence item is resolved on the client by #7.
