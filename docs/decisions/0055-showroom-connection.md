# 0055. Showroom connection to the backend

Date: 2026-11-02. Asked by: clarify-task, showroom connection (0054). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Whose balance the player sees | The balance everywhere (top bar, shop, preview) comes from the backend `GET /wallet` (`gems` → emeralds); this overrides 0052 #4. Rewards still on the mocks (ads, continue, season) do not change it in a dev build. The backend is asked for a test balance on test accounts. | 0052 #4, P3 |
| 2 | Kinds `buoy`, `beacon`, `number` | Equipped from the shop; the collection gets three slots after «Цель». Type and slot names: «Буй» / «Buoy», «Маяк» / «Beacon», «Цифры» / «Numbers». | 0054 #2, 0024 |
| 3 | Loadout source (S17) | The equipped items come from `GET /me/items.equipped` for the board, the collection, and the profile, never from the mocked `/me.loadout`. No badges slot (the backend has none). | Part 7 §3, §6 |
| 4 | «Видно в матче» (0054 #4) | Every kind except the effects (`tap`, `reveal`, `win`). | SHP-12, 0020 #4 |
| 5 | Rarity `exclusive` | Drawn as legendary; label «Эксклюзивный» / «Exclusive». | 0054 #2 |
| 6 | Drop banner | Title from the item `title`, subtitle from its `description`; no banner without `ends_at`. | S9, 0041 #7 |
| 7 | Default items (`default: true`) | Hidden in the shop and the collection; the collection keeps its «По умолчанию» row. | 0024 #7 |
| 8 | Purchase errors | `not_enough_coins` / `not_enough_gems` open the shortage sheet with `data.need`; `price_changed` shows the new price and asks again; `item_not_found` is handled as an ended offer; `app_update_needed` shows the generic error. | Part 7 §2, SHP-06, SHP-13 |
| 9 | Known backend gaps | Accepted (0054 #5): a retry after a lost answer shows «Это уже в твоей коллекции»; the struck bundle price is the backend's scaled one (S10); backend skins stay default (0054 #1); a bundle equips its first part (0054 #3). | 0054 |
| 10 | Equip after a bundle purchase when its first part is not in the shop | A toast with the generic error («Что-то пошло не так. Попробуй ещё раз»); the preview stays open. | 0054 #3 |

## Consequences

* Backend routes added: `GET /shop`, `POST /shop/items/{key}/buy`, `GET /me/items`, `PUT /me/equipment`, `GET /wallet`.
* The mocks answer these paths in the backend shape, so a mocks-only build behaves the same.
* The backend list (`docs/backend-handoff/backend-backlog.md`) asks for a test balance.
