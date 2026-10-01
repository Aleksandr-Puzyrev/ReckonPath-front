---
name: clarify-task
description: Spec-first clarification before writing any code for Reckon Path — finds the task's sections in docs/spec, cross-checks the design and docs/decisions, lists gaps and spec↔design conflicts, asks the developer one batch of questions in Russian, records answers in docs/decisions, and gets explicit confirmation. TRIGGER for any new feature, screen, flow, game rule, economy, text, or data change — before planning or coding. SKIP only for trivial mechanical tasks (rename, lint fix, bug with an exact error) and say why it was skipped.
allowed-tools: Read, Grep, Glob, Write, Edit
---

# Clarify Task

Implements `.claude/rules/05-rule-task-clarification.md`. The goal: every behaviour in the implementation traces back to the spec, the design, or a recorded decision — nothing is invented.

## 1. Collect sources (do not ask anything yet)

1. `docs/decisions/README.md` → read decisions touching the task.
2. `docs/spec/README.md` → pick the parts. Typical sets:
   * screen: Part 4 (screen) + Part 5 (texts) + Part 11 (scenarios) + Part 1 (product rules) + Part 3 (components/tokens);
   * game rule: Part 6 (normative) + Part 11 + Part 1 §2–§5;
   * data/API: Part 7 + Part 8 §6, §9;
   * acceptance: Part 12 (epics, DoR/DoD).
3. `Grep` each heading and read only those sections.
4. UI task: find the screen via `design/README.md`, read only its fragment (`data-screen-label`) or its image in `design/shots/`; note both themes.
5. Design gaps: where the design lacks a screen, state, or interaction, or contradicts itself, look at the prototype (`../peleng/src/game/`, read-only; there is no PvP prototype) and bring its behaviour as an option in the questions — never adopt it silently.
6. Existing code: check what is already implemented and reusable.

## 2. Build the requirement map

For yourself, list each requirement with its source (`Part 4 §5.2`, `design 19.3`, `decision 0003 #2`). Then list:

* **Gaps** — things the task needs that no source states (a text, a number, a state, an error, a transition, an edge case).
* **Conflicts** — spec vs design, spec part vs spec part, spec vs a decision, spec vs Expo/library reality.
* **Scope edges** — neighbouring features that must NOT be built now.

Walk the checklist in rule 05 ("What must be checked") so no category is missed.

## 3. Ask — one batch, in Russian

```md
Изучил: <list of sections and design screens>.

**Блокирующие**
1. <question> — В ТЗ (Часть N §x) сказано …, в дизайне (NN.K) — … Варианты: А) … Б) … Предлагаю Б, потому что …

**Уточняющие** (пока исхожу из предложенного)
2. <question> — Пока считаю, что …
```

Do not ask about anything the rules or spec Part 8 already fix (stack, structure, naming, style).

## 4. Record the answers

Write them to `docs/decisions/NNNN-<topic>.md` (template in `docs/decisions/README.md`; next free number) and add a row to the index. Never leave an answer only in the chat.

## 5. Confirm

Present:

1. The task in 1–2 sentences.
2. The step-by-step flow as it will be implemented (all branches, states).
3. Affected layers/slices/files.
4. Tests to be written (spec scenarios → tests).
5. Accepted assumptions.

Ask: «Правильно ли я понял задачу? Могу приступать к реализации?» — and stop until an explicit yes. On "no": ask what is wrong, re-clarify that part, repeat.
