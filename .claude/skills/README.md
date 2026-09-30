# Project skills

Invocable procedures for Reckon Path. Project skills take precedence over globally installed plugin skills covering the same step (`02-rule-skill-first.md`).

| Skill | When | Responsibility |
| --- | --- | --- |
| `clarify-task` | Before any new feature, screen, flow, rule, or data change | Spec-first lookup, gaps and conflicts, one batch of questions in Russian, record answers in `docs/decisions/`, explicit confirmation |
| `design-to-screen` | Building or changing UI after clarification | Map design → spec tokens, type scale, states, themes, i18n, a11y, verification against the design |
| `decompose-task` | Confirmed task with 3+ independent slices | Plan → developer approval → contracts → reference slice → parallel briefs → integration |

Typical flow: `clarify-task` → (`decompose-task` if large) → implementation (`design-to-screen` for UI) → done checks → `code-reviewer` agent.

## Authoring

Each skill is `skills/<kebab-case-name>/SKILL.md` with frontmatter `name` (= directory), `description` with explicit TRIGGER/SKIP wording, and `allowed-tools` (minimum set). Optional `templates/` and `scripts/`. Update this table when adding, renaming, or removing a skill.
