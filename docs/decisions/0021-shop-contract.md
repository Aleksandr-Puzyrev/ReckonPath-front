# 0021. Shop, inventory and loadout contract

Date: 2026-10-10. Asked by: stage 3 task 1 (clarify-task). Answered by: developer.

Points 1–5 are proposals **to agree with the backend** (0020 #1).

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Tab ids | `exclusive`, `holiday`, `elements`, `fields`, `bundles`, `profile`, `effects`. The «Наборы» tab is built by the client from `bundles[]`, not from `tabs[]`, so `ShopTab.id` never takes `bundles`. `featured.target` is `{ bundle }` or `{ item }`. The client does not show `effects` in stage 3 (0020 #4). | Part 7 §6, Part 1 §6.2 |
| 2 | Owned items no longer in the shop | Every `GET /inventory` entry carries the item description in the shop's shape: `type`, `rarity`, `name`, `description`, `preview`, `package`. | Part 7 §6 |
| 3 | Loadout slots | `field`, `fence`, `stream`, `rock`, `x2`, `bridge`, `bomb`, `target`, `avatar`, `frame`, `badges` (up to 3), `title`, `fxClick`, `fxReveal`, `fxVictory`. An item's `slot` takes the same values; `Me.loadout` and the `PUT /loadout` answer share one schema. | Part 1 §6.4, Part 7 §3, §6 |
| 4 | Price currency | Exactly one currency per item and bundle: `{ emeralds }` or `{ coins }`. | Part 1 §6.1–6.2 |
| 5 | Item name and description | In the player's language from `X-Locale`. | Part 1 §6.2, Part 8 §9.1 |
| 6 | Ads contract | Described in task 5, with the ads layer. | 0020 #6 |
| 7 | `NOT_OWNED` | Added to the error codes, HTTP 422 (`PUT /loadout`). No player text: equip is offered only for owned items, so it is a bug and shows the generic error. | Part 7 §6 |
| 8 | Mock catalog | From design 22.x: names, prices, rarities, bundles «Шторм» (◆1520 of ◆2340) and «Сад». Board and element skins are colour-only `skin.json` (0020 #3); `preview` and `package.url` are empty until task 2 decides the preview. Balance stays ◆2640 / ●18420. | design 22.x, 0018 #5 |
| 9 | Mock purchase | Charges the mock wallet, adds the item to the inventory, answers `INSUFFICIENT_FUNDS`, `ALREADY_OWNED`, `OFFER_ENDED`, `SOLD_OUT`, `PRICE_CHANGED`; a repeat with the same `Idempotency-Key` returns the stored answer (SHP-03). | Part 7 §1, §6, Part 11 SHP-01…09 |
| 10 | Freshness | Catalog fresh for `cacheTtlSec` (300 s); inventory for 1 min, as `/me`. | Part 7 §6, Part 8 §6.1 |

## Implementation notes

Date: 2026-10-10. Taken by the agent while implementing; to be confirmed by the developer.

| # | Topic | Decision | Source |
| --- | --- | --- | --- |
| 11 | Bundle card data (**to agree with the backend**) | `Bundle` also carries `name`, `description`, `rarity` and `preview`, like an item: Part 7 gives none, and the bundle card needs them. | Part 7 §6, design 22.6 |
| 12 | Item `type` values | `FIELD`, `ELEMENT`, `FRAME`, `TITLE`, `CLICK_FX`, `REVEAL_FX`, `VICTORY_FX` (Part 3 §10 types, underscores for the spaces); the contract keeps `type` a string. | Part 3 §10 |
| 13 | `null` in the loadout | Puts the slot back to the default item (Part 7 example `"fxVictory": null`). | Part 7 §6 |
| 14 | Mock bundle price | Owned parts priced in the bundle's currency are subtracted, down to 30% of its price (SHP-08). Only the mock computes it; the client shows the server's `price`. The design formula and mixed currencies are asked in task 3. | Part 1 §6.4, Part 11 SHP-08 |
| 15 | Mock featured drop | «Шторм» bundle: its name and description fill `title` and `subtitle`. | design 22.1 |
| 16 | Stock | No mock item has a stock limit (the design gives none); `SOLD_OUT` is reached in tests by overriding the handler. | design 22.x |

## Consequences

Task 1 adds `/shop`, `/shop/purchase`, `/inventory`, `/loadout` and the `Loadout`, `ShopItem`, `Bundle` schemas to `contracts/openapi.yaml`, msw handlers for them, and the `entities/item` slice with catalog and inventory queries. No UI.
