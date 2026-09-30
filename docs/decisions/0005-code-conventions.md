# 0005. Code conventions

Date: 2026-10-01. Asked by: developer. Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 2 | Slice `index.ts` files (public API re-exports) | **Keep them**, as spec Part 8 §5.3 requires: imports from outside a slice go through its `index.ts`. | Part 8 §5.3 |
| 1 | Comments in code | Remove descriptive comments, file/section headers, and spec references. Keep only non-obvious "why" comments, written in English **with a Russian translation in parentheses**. `TODO` comments stay English only. | — |

## Consequences

* `.claude/rules/08-rule-code-style.md` → "Comments" rewritten accordingly (it previously allowed spec citations).
