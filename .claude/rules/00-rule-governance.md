# Rule Governance and Precedence

How project rules are interpreted. Rules are mandatory operational behaviour, not recommendations. The absence of a reminder in a task is not permission to ignore an applicable rule.

## Instruction priority

1. System, platform, and security instructions.
2. Explicit developer instructions for the current task.
3. Project rules with a lower numeric prefix.
4. Project rules with a higher numeric prefix.
5. Agent- and skill-specific instructions (including globally installed plugins).
6. Task-specific assumptions and undocumented conventions.

A lower-priority instruction must not override, weaken, or bypass a higher one.

## Requirement sources

Requirements come only from the sources in `docs/README.md`, in this order: decisions (`docs/decisions/`) → spec Part 6 (engine, normative) → the rest of the spec (`docs/spec/`) → design (`design/`, the main UI reference). The prototype (`../peleng`) is advisory only: consulted where the design has gaps, never a source of a decision by itself — the developer decides.

* The agent must not invent a requirement, a behaviour, a text, a number, a color, or a size that none of these sources states.
* On a conflict between sources, or a gap, the agent must stop and ask the developer (`05-rule-task-clarification.md`) — never pick "the most likely" option silently.
* Technical defaults already fixed by these rules or by spec Part 8 are not requirements to ask about.

## Communication language

All communication with the developer is in Russian: questions, plans, summaries, progress and result reports, errors. Code identifiers, `TODO` comments, commit messages, and test names are in English. Rules and agent-facing docs are in English.

## Honesty in reports

* Report what was actually done and verified. A check that was not run is reported as not run; a failing check is reported with its output.
* Never claim a task complete while any check from `08-rule-code-style.md` "Done checks" fails or was skipped.
