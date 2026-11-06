# 0056. Consents, documents, onboarding screen fixes (iteration 1)

Date: 2026-11-06. Asked by: clarify-task, iteration 1 of `docs/remaining-work.md` (0053 d, e; push; check of 11.2, 29.4, 29.5, 31.3). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Push in iteration 1 | Moved to the stage 5 push task, after the EAS build setup: it needs `expo-notifications`, Firebase, an APNs key, and the real bundle id (0004 #12); the backend has no APNs sender (P15) and a different endpoint (P13, P16). | 0039 #4, 0048 #5, 0053 #6 |
| 2 | Where the client learns about consents | `consents` and `consentsRequired` are added to `Me` in `contracts/openapi.yaml`. The `GET /me` mock serves them in dev builds (`GET /me` stays on the mocks, 0052 #1); release builds read them from the backend. `PUT /me/consents` goes to the backend now. | P1, P12, 0052 #1 |
| 3 | Re-accept screen (no design) | A blocking modal screen at launch for an account whose `consentsRequired` is not empty, built from the form parts (0053 #1): title, body, links to the documents, «Принять» → `PUT /me/consents` with the required types accepted. There is no refusal (the backend accepts only `accepted: true` for `terms` and `privacy`); below the button, the existing «Выйти» signs out to a guest. A guest never sees it. Texts approved: `consents.title` «Мы обновили документы» / «We've updated our documents»; `consents.body` «Прочитай и прими новые условия и политику конфиденциальности, чтобы продолжить.» / «Read and accept the new terms and privacy policy to continue.»; `consents.accept` «Принять» / «Accept». | 0046 #5, 0053 #1, #5 d |
| 4 | Source of the documents | `GET /document?type=<key>` (PDF) opened in the in-app browser (0053 #7). Only `privacy_policy` exists; the terms link is shown once the backend adds its key (backlog C8). One PDF for both languages until the backend has RU/EN. | C8, 0053 #7 |
| 5 | Where the document links are | The «условия» and «политика конфиденциальности» words of the 1.4 consent become links (the TODO in `sign-up.tsx` goes); the re-accept screen of #3; settings get the «Конфиденциальность» / «Privacy» group with «Политика конфиденциальности» / «Privacy policy» and «Условия использования» / «Terms of use» (texts of Part 4 §12.1 and design 25.x). Ad settings, FAQ and events stay hidden. Supersedes 0040 #11 for the policy and terms rows. | Part 4 §12.1, design 1.4, 25.x, 0019 #16, 0040 #11 |
| 6 | Marketing switch | A switch row in the settings «Аккаунт» group, account only, label `account.signUp.marketing` «Хочу получать новости и подарки на e-mail»; the state comes from `Me.consents`, a toggle sends `PUT /me/consents` with `marketing`. A guest has no row. | 0050 #5 |
| 7 | Level 1 result (29.4) | Simplified: emblem, title `play.found` «Сигнал найден!», the note «Первый уровень — всегда 3★…» and one button «Дальше» to level 2. No moves line, record, «Ещё раз» or «К уровням». | Part 4 §2.2 p.4, design 29.4, 0013 #6 |
| 8 | Move-limit hint on level 2 (29.5) | Stays as built: the Part 5 text `onboarding.movesLimit`, no design title, not anchored to the counter. | Part 5, 0013 #6 |
| 9 | 11.2 and 31.3 | Stay as built: 11.2 uses the Part 5 text; 31.3 follows 0044 (no author, no «Ответить»). | 0044 #2, #3, #8 |

## Consequences

* `docs/remaining-work.md`: push leaves iteration 1 and joins the stage 5 push task; 1.4 is closed by #7–#9.
* `contracts/openapi.yaml` `Me` gains `consents` and `consentsRequired`, and the `PUT /me/consents` path (answer: `ConsentsState`); `BACKEND_ROUTES` gains `PUT /me/consents`. `GET /document` is not in the contract: the PDF opens in the browser by its API address, not through the API client.
* «Принять» stays disabled until the player's `consentsRequired` is loaded.
* Icons: the policy row draws the design's `§` glyph (`policy.svg`, colour `rarity.common` as in 25.x); the marketing row reuses the e-mail icon of «Написать в поддержку».
* The terms key and RU/EN document versions stay in `docs/backend-handoff/backend-backlog.md` (C8).
