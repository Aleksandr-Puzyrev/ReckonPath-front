# 0020. Stage 3 plan: economy and shop

Date: 2026-10-10. Asked by: stage 3 (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Backend and contract | As 0014 #1–2: no backend, msw mocks; `contracts/openapi.yaml` written from Part 7 §6. What Part 7 lacks is proposed to the backend and marked **to agree with the backend**: tab ids, data of owned items no longer in the shop, the full list of loadout slots, ad counters («3/5 сегодня») before an intent exists, the `NOT_OWNED` error code. | Part 7 §6 |
| 2 | Ad networks | An `AdsProvider` interface with a mock provider for dev builds and tests; every reward flow (intent → ad → SSV → poll → reward) is built now. The real SDKs (AdMob + UMP, Yandex Mobile Ads through `modules/yandex-ads`) come once the app and ad unit IDs and real bundle IDs exist (0004 #12). Which network goes first is asked at that task. | Part 8 §2.4, §10.1, §10.5 |
| 3 | Skins and assets | No CDN and no real skins yet: the mocks serve a few test board and element skins as colour-only `skin.json` (no textures). The board loads, caches and falls back to the default skin on any failure (SHP-11). Real packages come with the artist's assets. | Part 3 §10, Part 6 §7.3, Part 8 §3.4 |
| 4 | Animated cosmetics | The «Эффекты» tab (Lottie) and animated avatars (Rive) are not shown in stage 3; Lottie stays postponed (0013 #1). | Part 1 §6.2, Part 8 §2.2 |
| 5 | Profile | A minimal profile joins stage 3: header, the guest card «Сохрани прогресс» (0019 #4), the collection grid and the slot sheet. Statistics, achievements and nickname change come later. | Part 4 §10.1, design 23.1, 23.3 |
| 6 | Task order | (1) contract, mocks, the item entity, catalog and inventory queries; (2) shop screen (22.1): drop banner with timer, tabs, grid, «Скрыть купленное», offline; (3) preview and purchase (22.2–22.8): confirmation from ◆500, all errors, link sheet before the first ◆ purchase; (4) skins on the board, equip, minimal profile with the collection; (5) ads layer: `AdsProvider`, mock provider, ATT pre-screen 28.6; (6) rewarded placements: «+◆ 5» row in «Как заработать», continue for an ad, streak restore for an ad; (7) interstitials. | Part 12 §2 stage 3 |
| 7 | Out of stage 3 | «Удвоить ● за рекламу» on the win sheet (needs the win-sheet rewards, 0010 #15, 0018 #7); the `app-integrity` module (the integrity token stays empty with a TODO, 0014 #6). | — |
| 8 | Late ad reward | No push before stage 5: the toast «Награда придёт чуть позже», then the balance updates when the reward arrives. | Part 11 ADS-02, Part 12 E3-2 |
| 9 | Offline | The shop shows the cache; purchase is disabled with «Нужен интернет». | Part 11 NET-06, design 22.8 |
| 10 | Money | Purchases only for ◆ and ●; no IAP. | Part 1 §1.6 |
| 11 | Per-task clarification | Each task starts with its own clarification round for its screens; conflicts inside a screen (bundle discount formula, Part 5 vs design texts, effect slots, sorting) are asked there. | rule 05 |

## Consequences

Stage 3 starts with task 1. Native work (ad SDKs, `modules/yandex-ads`) waits for the developer's IDs; until then all ad flows run on the mock provider.
