# 0024. Skins on the board, collection and minimal profile

Date: 2026-10-10. Asked by: stage 3 task 4 (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Skin format and delivery | `package.url` points straight at `skin.json` (no zip yet). A subset of Part 6 §7.3: `light` / `dark` with `frame.gradient`, `cell.stops`, `number`; element skins carry `elements` as colours (fence, stream, bridge, bomb, target marker), not SVG. Loaded by a query with the usual 24 h cache. Zip packages, textures and SVG come with real assets (they need `expo-file-system` and a rebuild). | Part 6 §7.3, Part 3 §10, 0020 #3 |
| 2 | «Скрытые клетки одинаковы» | Within one board all hidden cells look the same and hint nothing; a skin may recolour them. | Part 1 §6.6, Part 11 SHP-10, design 22.x |
| 3 | Profile header | Letter avatar from the nickname, nickname, «Уровень N» («Уровень N · гость» for a guest), bar «XP n / m» from `GET /me`. League, trophies, badges and friends come with their stages. | Part 4 §10.1, design 23.1, 23.2 |
| 4 | Guest card | «Сохрани прогресс», «Гостевой прогресс пропадёт при смене телефона», buttons «Зарегистрироваться» and «Войти» opening the forms (0019). | design 23.2, 0019 #13 |
| 5 | Where the skin shows | Every board: play, the level-list and daily previews, the shop hero. | Part 4 §9.1, Part 11 SHP-10 |
| 6 | Collection | 11 tiles from design 23.1: ПОЛЕ, ЗАБОР, РУЧЕЙ, СКАЛА, ×2, МОСТ, БОМБА, ЦЕЛЬ, АВАТАР, РАМКА, ТИТУЛ; FX hidden (0020 #4). A tile shows the equipped item or «По умолчанию». | Part 4 §10.1, design 23.1 |
| 7 | Slot sheet | Live preview on top for board slots; «По умолчанию» first, then owned items of the slot from the inventory with «Надето» / «есть»; a tap equips at once, «По умолчанию» sets the slot to `null`; «Ещё в витрине →» opens the shop; offline the choice is disabled (0023 #20). | Part 4 §10.1, design 23.3 |
| 8 | Shop preview | Interactive 5×5 board in the item's skin (taps show numbers) and the ☀ / ☾ switch for the skin's themes (closes 0023 #2). | Part 4 §9.2, design 22.2 |
| 9 | Skin not loaded | The default skin, no error; the next visit picks it up (SHP-11). | Part 11 SHP-11 |
| 10 | Out of scope | World theme into the collection (LVL-24, rewards); minimum-version filter (SHP-13, server); skins in PvP (SHP-12); profile statistics and achievements; the «Настройки» button. | — |

## Implementation notes

Date: 2026-10-10. Taken by the agent while implementing; to be confirmed by the developer.

| # | Topic | Decision | Source |
| --- | --- | --- | --- |
| 11 | Skin download | `fetchAssetJson` in `shared/api` goes through the API transport (the mocks in dev builds), outside the API base URL. | Part 8 §3.4 |
| 12 | Element colour keys | A skin's `elements` keys are the board palette names (`fence`, `stream`, `bridge`, `mine`, `target`…); only known keys with the same shape are taken, so a wrong skin cannot break drawing. | 0024 #1 |
| 13 | Mock skins | Colour palettes of design 22.x in `mocks/mock-skins.json` (colour literals are not allowed in code). | design 22.x |
| 14 | Theme switch labels | `settings.theme.light` / `dark` of Part 5; sun and moon icons added. | Part 5 §5 |
| 15 | Shared preview level | `PREVIEW_LEVEL` (first 5×5 campaign level) moved to `entities/level`, used by the shop and the profile. | — |
| 16 | Progress bar size | `sizes.progressBar` (renamed from `strengthBar`) serves the password strength and the XP bar. | design 1.4, 23.1 |
| 17 | Skin cache key | `itemKeys.skin(url)` lies outside the `item` prefix, so refreshing the shop after an equip does not cancel or refetch loaded skins. | rule 10 |
| 18 | Queries per board | Every board reads `/me` and `/inventory` from the shared cache (stale after 1 min); no extra request per board while fresh. | rule 10 |

## Consequences

Task 4 adds skin loading and the equipped skin to every board, the interactive shop preview with the theme switch, the profile screen (header, guest card, collection, slot sheet) and colour-only skins in the mocks.
