# 0002. Setup follow-ups

Date: 2026-09-30. Asked by: Claude Code configuration setup. Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Routes in root `app/` (spec) vs Expo Router's `src/app/` precedence | Routes stay in **`src/app/`**; the FSD app layer (providers, bootstrap, guards) lives in **`src/application/`**. Resolves the open item in 0001. | Part 8 §5.2 |
| 2 | Token pipeline: spec expects Figma Variables → Tokens Studio → Style Dictionary | **There is no Figma.** Design tokens are written by hand in `src/shared/theme/` with the spec's names and values (Part 3 §2–§4, §8). The Figma/Style Dictionary pipeline (Part 3 §12.1, Part 8 §3.2) does not apply. | Part 3 §12, Part 8 §3.2 |
| 3 | Role of the design and the prototypes | **The design (`design/`) is the main reference for building screens and UI.** It is not fully worked out, so gaps and inconsistencies are expected. In those cases, consult the prototypes (`../peleng` — campaign/daily/editor web prototype, `../arena` — PvP prototype) for how it was done, and **ask the developer** which way to go. Prototypes are read-only and never decide on their own. | Part 1 §1 (prototype «Пеленг», concept v82) |
| 4 | Node version | Node **22.23.0**, pinned in `.nvmrc`; tooling switches via nvm. | — |

## Consequences

* Source priority (`docs/README.md`) gains a fifth, advisory-only level: prototypes.
* Spec Part 6 remains normative for game rules; where a prototype's engine differs from Part 6, Part 6 wins and the difference is reported (`09-rule-game-engine.md`).
* The priority between the spec and the design from 0001 #5 is unchanged; any conflict between them is still asked, not resolved silently.
