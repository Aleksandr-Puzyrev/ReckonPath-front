# Documentation index

Where every requirement for Reckon Path lives. Agents start here to locate the one section a task needs — never read whole documents.

| What | Where | Authority |
| --- | --- | --- |
| Product specification (13 parts) | [`spec/README.md`](spec/README.md) → `spec/NN-*.md` | Source of truth for requirements |
| Specification, original single file | [`PELENGE_TZ.md`](PELENGE_TZ.md) | Same content as `spec/`; `.docx`/`.pdf`/`.html` copies are not used by agents |
| Design (screens, both themes) | [`../design/README.md`](../design/README.md) | Visual reference; the spec wins on conflict |
| Decisions and answers to clarifying questions | [`decisions/`](decisions/) | Binding; extends the spec |
| Prototypes (outside the repo, read-only) | `../peleng/src/game/` (campaign, daily, editor, level codes), `../arena/src/game/` (PvP) | Advisory only: consulted where the design has gaps; the developer decides |

## Source priority

When sources disagree, the higher one wins. An agent must not resolve a conflict silently — it stops and asks the developer (see `.claude/rules/05-rule-task-clarification.md`).

1. Decisions in `decisions/` (explicit developer answers; newer beats older).
2. Spec Part 6 «Спецификация движка и контента» — normative for game rules.
3. The rest of the spec.
4. Design in `../design/` — the main reference for building screens and UI; not fully worked out.
5. Prototypes — only where the design has gaps or inconsistencies, and always with a question to the developer (`decisions/0002-setup-follow-ups.md`).

## Naming

«PELENGE» / «Пеленг» in the spec is the former working title. The product is **Reckon Path** (`decisions/0001-project-setup.md`). Code, packages, and configuration use Reckon Path; spec text is not edited.

## Keeping this index current

* A new decision → a new file in `decisions/` and a row in `decisions/README.md`.
* The spec changes → replace `PELENGE_TZ.md`, re-split into `spec/` (one file per «# Часть N»), regenerate `spec/README.md`.
