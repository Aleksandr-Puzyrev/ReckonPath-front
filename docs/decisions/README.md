# Decisions

Binding answers from the developer that extend or override the spec. One file per decision round: `NNNN-<kebab-case-topic>.md`. Newer decisions override older ones on the same point — mark the old point `Superseded by NNNN`.

Agents record every answer to a clarifying question here (see the `clarify-task` skill), so the same question is never asked twice.

| # | File | Topic |
| --- | --- | --- |
| 0001 | [`0001-project-setup.md`](0001-project-setup.md) | Product name, repository layout, scope, naming, source priority, language |
| 0002 | [`0002-setup-follow-ups.md`](0002-setup-follow-ups.md) | Routes in `src/app/` + FSD app layer in `src/application/`, hand-written tokens (no Figma), design as main UI reference with prototypes as fallback, Node 22 |
| 0003 | [`0003-infrastructure-setup.md`](0003-infrastructure-setup.md) | Stage 0 tooling: empty root screen, no web, template package cleanup, dev packages, double quotes + semicolons, scope limits |
| 0004 | [`0004-ui-foundation.md`](0004-ui-foundation.md) | Dev builds, system theme, `bg.glass` token, design-style active tab, Google Fonts packages, UI-foundation scope |
| 0005 | [`0005-code-conventions.md`](0005-code-conventions.md) | Comments: only non-obvious "why", English + Russian translation in parentheses; TODO in English; keep slice `index.ts` |
| 0006 | [`0006-engine-stage-a.md`](0006-engine-stage-a.md) | Engine split into stages A/B/C, hand-derived vectors, level schema in `contracts/`, nullable stars |
| 0007 | [`0007-engine-stage-b.md`](0007-engine-stage-b.md) | Solver scoring and bomb model, tie-breaking, daily EPOCH as a parameter, Part 6 wins over Part 1 for daily tiers, golden vectors for the solver |
| 0008 | [`0008-engine-stage-c.md`](0008-engine-stage-c.md) | Level codes `RP2-` with fflate and CRC-8/SMBUS; no match state machine in the engine — match vectors for Go, replayed in TS by a test-only reference; turn limit re-checked after skipped turns |
| 0009 | [`0009-engine-refactor.md`](0009-engine-refactor.md) | PvP map norm with bomb penalty 1; spec names and topic modules in the engine (exception to rule 07) |
| 0010 | [`0010-play-screen.md`](0010-play-screen.md) | Stage 1 split into four tasks; board + play screen first; continue stubs; unexploded bomb counter; design colours for the light board; relative heat |
| 0011 | [`0011-levels-list.md`](0011-levels-list.md) | Spec worlds with design look, test levels as world 1, design row and tile style, disabled editor/code buttons, FlashList, current level and world unlocking rules |
| 0012 | [`0012-worlds-1-2-content.md`](0012-worlds-1-2-content.md) | Levels in `packages/content`, hand-made layouts with bot-computed limits, tutorial level 1 without a limit, `content:check` rules |
| 0013 | [`0013-rule-cards-tutorial.md`](0013-rule-cards-tutorial.md) | Sound and Lottie postponed, design mini-board demos, all cards + flags + «Число», cards derived from level content, level 1 tutorial, settings store |
| 0014 | [`0014-stage-2-plan.md`](0014-stage-2-plan.md) | Stage 2 order of tasks, mocks instead of a backend, agent-written `openapi.yaml` from Part 7, no API URLs yet; remote texts dropped in favour of OTA updates |
| 0015 | [`0015-guest-sign-in.md`](0015-guest-sign-in.md) | Silent guest sign-in, new guest on a revoked session, ban screens and `GET /me` postponed, device ID in SecureStore, auth mocks |
| 0016 | [`0016-attempts-sync.md`](0016-attempts-sync.md) | Outbox of finished attempts, `GET /progress` reconciliation by maximum with pending attempts, no `contentVersion` yet, continue method in the log |
| 0017 | [`0017-daily-and-streak.md`](0017-daily-and-streak.md) | Daily split 5a / 5b, `GET /daily/history` proposal for the calendar, Home daily card only, daily unlocked after campaign level 6, overrides for 7 days |
| 0018 | [`0018-wallet-and-continue.md`](0018-wallet-and-continue.md) | Online `POST /continue`, offline continue charged with the attempt, TopBar with the design emblem, minimal «Как заработать», free dev continue removed, streak restore for ◆ |
| 0019 | [`0019-account-sign-in.md`](0019-account-sign-in.md) | Login and password instead of Apple / Google, VK ID later; link sheet after level 6 and after a revoked session; client-side account conflict; proposed `/auth/register` and `/auth/login` |
| 0020 | [`0020-stage-3-plan.md`](0020-stage-3-plan.md) | Stage 3 order of tasks, mocks and a contract from Part 7 §6, mock ads provider until IDs exist, colour-only test skins, no effects tab, minimal profile, double-for-ad and app-integrity out |
| 0021 | [`0021-shop-contract.md`](0021-shop-contract.md) | Proposed shop tab ids, item data in the inventory, full loadout slots, one-currency prices, `NOT_OWNED`, mock catalog from design 22.x |
| 0022 | [`0022-shop-screen.md`](0022-shop-screen.md) | Shop screen: placeholder previews, `visibleInMatch`, sorting, design texts over Part 5, timers, effects hidden, taps wired in task 3, states |
| 0023 | [`0023-shop-preview-purchase.md`](0023-shop-preview-purchase.md) | Preview as a bottom sheet, static preview until skins, coins shortage sheet, link offer on the first ◆ buy tap, equip from the shop, server-side bundle price, purchase errors and texts |
| 0024 | [`0024-skins-and-collection.md`](0024-skins-and-collection.md) | `skin.json` subset without zip, recolourable hidden cells, skin on every board, minimal profile header and guest card, collection tiles and slot sheet, interactive shop preview |
| 0025 | [`0025-ads-layer.md`](0025-ads-layer.md) | Real ATT request with a pre-screen, `GET /ads/limits` proposal, mock ads provider without UI, design texts for the pre-screen; VK ID not planned for now |
| 0026 | [`0026-rewarded-placements.md`](0026-rewarded-placements.md) | Ad row look and counter, late reward handling, rewarded flow, lose-sheet ad button states, no pause, ad streak restore |

## Template

```md
# NNNN. <Topic>

Date: YYYY-MM-DD. Asked by: <agent/task>. Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | … | … | Part N §x.y |

## Consequences

<What changes in code, rules, or docs because of these decisions.>
```
