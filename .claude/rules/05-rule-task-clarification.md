# Task Clarification Before Development

**Do not write code from an incomplete task.** Requirements invented on the developer's behalf are the worst outcome: the code gets redone. The procedure below is automated by the `clarify-task` skill.

## When to clarify

* Always — for new functionality, a new screen, a change to a flow, data, game rule, economy, or text.
* May be skipped only for trivial mechanical tasks (rename, fix a lint error, fix a bug with the exact error attached) — state that clarification was skipped and why.
* A task that admits two readings is a reason to ask, not to pick one.

## Spec-first

Before asking anything, the agent must look up the answer itself: decisions → spec sections → design → existing code. Ask only what those sources do not answer. Every question cites where the agent looked: «В ТЗ (Часть 4 §5.2) сказано X, а в дизайне (5.3) — Y».

## What must be checked

1. **Spec coverage.** Which spec sections define the task? Is anything the task needs not stated there?
2. **Spec ↔ design conflicts and design gaps.** Layout, texts, states, colors, element order. Every conflict is reported. The design is not fully worked out: where a screen, state, or interaction is missing or inconsistent, look at how the prototype does it (`../peleng/src/game/`, `../arena/src/game/`) and ask with that as an option: «В дизайне нет X; в прототипе сделано так — …; делаем так же или иначе?».
3. **Flow, step by step.** Entry points, first view, every action and its result (success, error, cancel, offline), exits. Every branch.
4. **Game rules.** Exact behaviour per spec Part 6, including edge cases from Part 11. No rule is implemented from memory of "how such games work".
5. **Data and API.** Endpoints and payloads from spec Part 7. If an endpoint or field is missing — ask: mock, wait, or agree a contract.
6. **States.** Loading, empty, error, offline (spec Part 1 §8.2), both themes, RU and EN.
7. **Texts.** Keys and strings from spec Part 5. A missing string is a question, not an invented text.
8. **Boundaries.** What is explicitly NOT in this task.
9. **Definition of done.** Acceptance criteria (spec Part 12 epics where available) and required tests.

## How to ask

* One batch, numbered, in Russian. Split into **блокирующие** (cannot start) and **уточняющие** (can start with a stated assumption: «Пока считаю, что X»).
* Offer options with a recommendation: «Предлагаю Б, потому что…».
* Close all gaps in 1–2 rounds; a second round only for gaps revealed by the answers.

## What NOT to ask

Stack, structure, naming, code style, and other decisions already fixed by these rules or spec Part 8; internal implementation details that do not change the result; anything answerable from the sources above.

## Recording and confirmation

1. Record every answer in `docs/decisions/` (new file or appended round) so it is never asked again.
2. Present a summary: the task in 1–2 sentences, the step-by-step flow, affected files/slices, accepted assumptions.
3. Ask: «Правильно ли я понял задачу? Могу приступать к реализации?» — and wait for an explicit yes.
4. If the developer says the understanding is wrong — ask what exactly is wrong, re-clarify that part, re-confirm.

If a contradiction surfaces during implementation — stop and ask; do not decide alone.
