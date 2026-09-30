# Decisions

Binding answers from the developer that extend or override the spec. One file per decision round: `NNNN-<kebab-case-topic>.md`. Newer decisions override older ones on the same point — mark the old point `Superseded by NNNN`.

Agents record every answer to a clarifying question here (see the `clarify-task` skill), so the same question is never asked twice.

| # | File | Topic |
| --- | --- | --- |
| 0001 | [`0001-project-setup.md`](0001-project-setup.md) | Product name, repository layout, scope, naming, source priority, language |
| 0002 | [`0002-setup-follow-ups.md`](0002-setup-follow-ups.md) | Routes in `src/app/` + FSD app layer in `src/application/`, hand-written tokens (no Figma), design as main UI reference with prototypes as fallback, Node 22 |
| 0003 | [`0003-infrastructure-setup.md`](0003-infrastructure-setup.md) | Stage 0 tooling: empty root screen, no web, template package cleanup, dev packages, double quotes + semicolons, scope limits |

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
