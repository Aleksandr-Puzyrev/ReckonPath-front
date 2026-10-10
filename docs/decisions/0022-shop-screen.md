# 0022. Shop screen

Date: 2026-10-10. Asked by: stage 3 task 2 (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Item previews | The image when the server sends a `preview` URL; otherwise a placeholder: the type icon on a tile tinted by rarity. Board previews are revisited with the skins in task 4. | Part 4 §9.1, 0021 #8 |
| 2 | «Видно в матче» | `ShopItem.visibleInMatch` filled by the server (**to agree with the backend**); the card shows the mark when it is true. | Part 4 §9.1, Part 11 SHP-12, design 22.1 |
| 3 | Sorting | Owned last; limited (with `availableTo`) first; then by rarity, legendary to common. «Новые» once the server gives a flag for it. | Part 4 §9.1, design 22.1 |
| 4 | Texts | Design texts win over Part 5 where they differ (as 0014 #9): EN eyebrow "SHOWROOM", EN title "Collect your signal.", EN tab "Bundles", card marks «ЕСТЬ» / «НАДЕТО» / «СОБРАНО», banner «LIMITED DROP», «Открыть набор», banner timer without «Ещё». | Part 5 §5, design 22.1 |
| 5 | Timers | Banner «6 ДНЕЙ», card «5д 14ч»; both switch to чч:мм in the last 24 h and tick every minute. An ended offer leaves on the next catalog refresh (E3-3). | Part 1 §6.3, Part 12 E3-3, design 22.1 |
| 6 | Effects outside their tab | Effect items are hidden in every tab (0020 #4); bundles with an effect part are still shown. | 0020 #4 |
| 7 | Taps in this task | Cards and «Открыть набор» do nothing yet: preview and purchase are task 3. The «Наборы» tab is built from `bundles[]`; a bundle card shows «НАБОР», rarity, price or «СОБРАНО». | 0021 #1 |
| 8 | Header | `TopBar` with the balance, a tap opens «Как заработать» (0018 #2). The hero shows a static `BoardPreview` in the default skin until skins come in task 4. | Part 4 §9.1, design 22.1 |
| 9 | States | Loading — card skeletons; error without cache — message and «Повторить» (`common.retry`); offline with cache — the catalog and «Обновлено {{time}}» (`common.updatedAt`); offline without cache — «Нет сети» (`common.offline`). | Part 1 §8.2, Part 11 NET-06 |
| 10 | Card | Rarity-coloured frame (`rarity.*` tokens) and rarity tag; no legendary shimmer yet (polish). | Part 4 §16, Part 3 §7 |
| 11 | «Скрыть купленное» | Screen state only, not persisted. | Part 4 §9.1 |

## Implementation notes

Date: 2026-10-10. Taken by the agent while implementing; to be confirmed by the developer.

| # | Topic | Decision | Source |
| --- | --- | --- | --- |
| 12 | Rarity colours | The spec tokens `rarity.*` (Part 3 §2), not the design's raw colours (#5FB8FF, #A77BFF, #FFC84E). | rule 13 |
| 13 | Hero board | The first 5×5 campaign level in `BoardPreview`, size 112 as in the design hero. | design 22.1 |
| 14 | Error without cache | `errors.generic` with «Повторить»; Part 5 has no shop-specific error text. | Part 1 §8.2, Part 5 §6 |
| 15 | Type labels | Shop type names from design 22.x; rock, ×2 and bridge from the collection labels of design 23.3. | design 22.x, 23.3 |
| 16 | `formatClockTime` | Moved from `screens/system` to `shared/lib`, now used by two screens. | rule 06 |

## Consequences

Task 2 adds `visibleInMatch` to the contract, builds `screens/shop`, `widgets/shop-grid` (cards, tabs, filter) and the featured banner, wires `TopBar` and `EarnSheet` on the shop tab.
