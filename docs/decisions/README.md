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
