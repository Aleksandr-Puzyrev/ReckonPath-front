# Rules index

Mandatory operating rules for agents working on the Reckon Path mobile client. Rules without `paths:` frontmatter load every session; rules with `paths:` load automatically when matching files are touched. When planning before any file is touched, read the rules for the affected area from this index.

Rules hold operational constraints only. Product requirements live in `docs/` (see `docs/README.md`).

| # | File | Loads | Responsibility |
| --- | --- | --- | --- |
| 00 | `00-rule-governance.md` | always | Priority order, source priority, language, how rules are authored |
| 01 | `01-rule-task-bootstrap.md` | always | Mandatory pre-task sequence: rules, spec, design, decisions, Expo docs |
| 02 | `02-rule-skill-first.md` | always | Use an applicable skill before manual work; what to do when a skill fails |
| 03 | `03-rule-scope-boundaries.md` | always | Project scope (mobile client only) and agent scope; four-option handoff |
| 05 | `05-rule-task-clarification.md` | always | No code from an incomplete task; spec-first clarification, confirmation before coding |
| 06 | `06-rule-architecture-fsd.md` | always | Stack, Feature-Sliced layers, import direction, directory layout |
| 07 | `07-rule-naming-conventions.md` | always | kebab-case files, suffixes, components, variables, types, stores, queries |
| 08 | `08-rule-code-style.md` | always | Minimal code, TypeScript strict, React rules, errors, comments, done-checks |
| 09 | `09-rule-game-engine.md` | `packages/engine/**` | Pure deterministic engine, reducer contract, test vectors |
| 10 | `10-rule-data-layer-tanstack-query.md` | `src/**/api/**` | Generated OpenAPI client, query/mutation factories, offline, idempotency |
| 11 | `11-rule-state-zustand-mmkv.md` | `src/**/model/**`, `*-store.ts` | Where state lives, store design, persistence and migrations |
| 12 | `12-rule-forms-react-hook-form-zod.md` | `*-schema.ts`, `*-form*.tsx` | Forms and validation |
| 13 | `13-rule-ui-unistyles-tokens.md` | UI files | Unistyles 3, design tokens only, text variants, screen states |
| 14 | `14-rule-animations-and-graphics.md` | UI and board files | Reanimated / Skia / Lottie / Rive boundaries, motion tokens, board |
| 15 | `15-rule-i18n-and-accessibility.md` | `src/**/*.tsx`, i18n | No hard-coded strings, RU/EN keys, a11y labels, reduced motion |
| 16 | `16-rule-testing.md` | test files | Jest + RNTL, coverage targets, placement, writing rules |
| 17 | `17-rule-lint-and-typecheck.md` | tooling configs | Commands, pre-commit hook, linter policy |
| 18 | `18-rule-task-orchestration.md` | always | When and how to split work across subagents |
| 19 | `19-rule-token-economy.md` | always | Targeted reading, filtered output, delegation |

Number 04 is intentionally unused (project scope is merged into 03).

## Authoring rules

* One responsibility per file, named `<NN>-rule-<kebab-case>.md`; lower number = higher priority.
* Direct, testable language: "must" / "must not". Exceptions stated explicitly.
* No duplication of a higher-priority rule — reference it.
* When a rule changes, update this index, related skills (`.claude/skills/`), and the reviewer agent checklist (`.claude/agents/code-reviewer.md`).
