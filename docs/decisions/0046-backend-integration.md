# 0046. Backend integration: first answers after the audit

Date: 2026-10-25. Asked by: `check-backend` audit of `../reckon-path-backend` @ 3af4a15 (`docs/backend-discrepancies.md`). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Whose API conventions win (envelope, casing, error codes, base path) | The backend adapts to Part 7 §1–2; the client contract stays. Superseded by 0047: the client adopts the backend conventions. | Part 7 §1–2 |
| 2 | Campaign architecture | Both offline and online play are required. Offline is not ready on the backend; the required backend work is listed in `docs/backend-discrepancies.md` «Offline campaign: what the backend must provide». | Part 8 §1.3, Part 1 §9.3, 0016, 0018 |
| 3 | Source of truth for campaign content | Most likely `packages/content`; the developer confirms with the backend developer. | Part 6 §8.3 |
| 4 | Screens the backend flows need but the design lacks (e.g. the registration email code) | They are added to the client. Each one goes through `clarify-task` (layout from the design system, texts approved by the developer). | 0019 |
| 5 | Backend features no source describes: VK ID and Yandex ID sign-in and linking, versioned consents, captcha, device list with remote sign-out, PDF documents, daily cap on offline coins | All are part of the product and are added to the client. Each is its own task through `clarify-task`; a new SDK still needs library approval (rule 06). Supersedes the «VK ID not planned» point of 0025. | 0019 #21, 0025 |

## Consequences

* The register rows A19–A22, P12, P17, C8, G19, K8 change from "not used" to client tasks.
* `contracts/openapi.yaml` and spec Part 7 stay the source of the API conventions; the backend follows them.
