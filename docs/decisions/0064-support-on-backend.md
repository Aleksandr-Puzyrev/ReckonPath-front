# 0064. Support on the backend

Date: 2026-11-23. Asked by: clarify-task for connecting support requests to the backend (`internal/features/support`, backend `283c87e`; Part 1, Part 4 §12.1 and §12.4, Part 7 §7, design 25.x and 28.4, decisions 0038, 0040 #11, 0051 #10). Answered by: developer.

The rule of 0060 holds: where the backend and the spec or earlier decisions differ, the client follows the backend.

| # | Question | Decision | Supersedes |
| --- | --- | --- | --- |
| 1 | Contract | `POST /support/tickets {topic: ban_appeal | support, message ≤1000, diagnostics {appVersion ≤40, device ≤120, userId}}` → `{ticketId}` on the backend; the request needs an account (no guest path, 0060 #1) and passes under a full ban. | 0051 #10 (guest support) |
| 2 | Ticket limit | 429 `tickets_limit` (5 per 24 h) → `errors.tickets_limit` «Обращений сегодня уже много. Напиши завтра» / "You’ve sent a lot of messages today. Write again tomorrow". | — |
| 3 | Settings sheet texts | Own keys for topic `support`: `settings.supportField` «Опиши вопрос или проблему» / "Describe your question or problem"; `settings.supportSent` «Сообщение отправлено» / "Message sent". The appeal keeps the 0038 texts. | 0040 #11 (appeal texts reused) |
| 4 | Answers | By email only, as the backend sends them; a «Мои обращения» list (`GET /support/tickets`) is a separate task with a design. | — |
| 5 | `userId` | Still sent in `diagnostics`; the backend ignores it. | — |
| 6 | Idempotency | A new `Idempotency-Key` per «Отправить». | — |
| 7 | Offline | Toast `errors.NETWORK` «Нет связи с сервером» (any failed request, not only a lost network); the sheet stays open with the text; nothing is queued. | — |
| 8 | `rate_limit_unavailable` | `errors.rate_limit_unavailable` «Сервис временно недоступен. Попробуй позже» / "Service temporarily unavailable. Try again later". | — |
| 9 | Out of scope | The ticket history, the critical error screen 28.5, FAQ and events rows, the new events, achievements and notification history endpoints. The campaign and arena changes of backend `3cb48e7` / `283c87e` are checked in a separate task. | — |

## Consequences

* `contracts/openapi.yaml`: topic enum, diagnostics lengths, 422 / 429, `tickets_limit` and `rate_limit_unavailable` codes; the route goes to `BACKEND_ROUTES`; `/v1/support/tickets` leaves the public (no token) paths; the mock follows the backend.
* `docs/backend-discrepancies.md` G21 and the support row are closed; `backend-todo.md` and `frontend-answers.md` §6 are updated.
