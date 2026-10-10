# 0023. Shop preview, purchase and equip

Date: 2026-10-10. Asked by: stage 3 task 3 (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Preview container | A bottom sheet (`@gorhom/bottom-sheet`) like the other sheets; the route sheet `shop/item/[id]` comes with deep links (scheme and domain undecided, 0001). | Part 8 §7, Part 4 §9.2 |
| 2 | Live preview | Now: board and element items show a static board in the default skin; frame and title show the large placeholder of the card. With the skins in task 4: the interactive 5×5 board and the light / dark switch. | Part 4 §9.2, 0020 #3 |
| 3 | Not enough coins | The same «Как заработать» sheet with the icon of the missing currency: «Не хватает ● N». | Part 1 §6.4 |
| 4 | Link offer before the first ◆ purchase | A guest's first «buy for ◆» tap opens the link sheet instead of buying; after «Позже» the next tap buys as usual. Once per player. | Part 1 §7.6, 0019 #4 |
| 5 | Equip from the shop | In this task: «Экипировать» after a purchase (22.4) and in the preview of an owned item; `PUT /loadout` applied optimistically (rule 10); toast «Экипировано: X»; the card mark «НАДЕТО». Applying skins on the game board is task 4. | Part 1 §6.4, design 22.4 |
| 6 | Bundle price | Computed by the server: the client shows `price` and strikes `basePrice` (22.6); parts marked «уже есть» from `ownedItems`. No client formula, so 0021 #14 no longer matters for the client. | Part 7 §6, design 22.6 |
| 7 | Confirmation | Only for ◆ prices from 500; none for ●. | Part 1 §6.4 |
| 8 | Price changed | Toast `errors.PRICE_CHANGED`, the new price on the button, and the confirmation again at any amount. | Part 12 E3-1 |
| 9 | Texts | Design texts (as 0022 #4): «Купить «X» за ◆ N?» + «Останется ◆ N на балансе»; «ПОКУПКА ПРОШЛА» + «Баланс: ◆ N», «Позже» / «ЭКИПИРОВАТЬ»; «Предложение завершено» + «Окно продаж закрылось. Товар убран из витрины, деньги не списаны.» + «Понятно»; «Тираж раскуплен» title only with «Понятно»; «Покупаем…», «Нужен интернет», «Экипировано ✓» (the tick as an icon). | Part 5 §5, design 22.3–22.8 |
| 10 | Errors | `ALREADY_OWNED` — toast «Это уже в твоей коллекции», catalog refresh, button «Экипировать»; `OFFER_ENDED` / `SOLD_OUT` — dialog, then the sheet closes and the catalog refreshes; network or timeout — up to 3 retries with the same key (SHP-03), then the toast «Нет связи с сервером». | Part 1 §6.4, Part 11 SHP-03, SHP-05…07 |
| 11 | While buying | Button in loading, the sheet cannot be closed. | Part 4 §9.3 |
| 12 | After success | Wallet, catalog and inventory refresh; a short purchase animation on motion tokens. | Part 4 §9.3, Part 3 §8 |
| 13 | Offline | Buy button disabled with «Нужен интернет». | Part 1 §6.4, design 22.8 |

## Round 2

Date: 2026-10-10. Answered by: developer (after the code review).

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 19 | Order of checks on «buy» | Shortage first: the link offer (#4) shows only when the purchase can go through, so a short guest does not spend the single offer. | Part 1 §7.6 |
| 20 | Equip offline | «Экипировать» is disabled with «Нужен интернет», like the purchase (#13). | Part 1 §6.4 |
| 21 | Lost «Экипировано» toast | The toast comes from the mutation itself, so closing the preview before the answer does not drop it. | design 22.4 |

## Implementation notes

Date: 2026-10-10. Taken by the agent while implementing; to be confirmed by the developer.

| # | Topic | Decision | Source |
| --- | --- | --- | --- |
| 14 | Currency inside a sentence | Texts keep the currency as an `<icon/>` tag rendered with `Trans` (no ◆ glyph in strings, Part 1 §8.3); `Dialog` title and message accept rich content. | Part 5, rule 13 |
| 15 | Equip after a bundle purchase | «Экипировать» equips every part of the bundle in one `PUT /loadout` (the design equips only its first part). | design 22.4, Part 1 §6.4 |
| 16 | Moved shared code | The retry policy moved from the app layer to `shared/api`; the offer model, timer formatters, price helpers and the placeholder preview moved from the `shop-grid` widget to `entities/item`, as the preview widget needs them too. | rule 06 |
| 17 | Confirmation threshold | `PURCHASE_CONFIRM_FROM_EMERALDS = 500` in `shared/config`, next to the continue price; to come from remote config with it. | Part 1 §6.4 |
| 18 | Account store | Version 2: `isPurchaseOfferUsed` added, version 1 data migrates with it unused. | rule 11 |

## Consequences

Task 3 adds the preview sheet, the purchase and equip features, the confirm, success and error dialogs, wires the shop cards and «Открыть набор», and the link offer before the first ◆ purchase.
