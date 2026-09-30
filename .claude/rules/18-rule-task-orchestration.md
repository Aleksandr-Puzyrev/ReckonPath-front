# Task Orchestration and Decomposition

When a task may be split across parallel subagents. The procedure is the `decompose-task` skill; this rule sets the boundaries.

## When to decompose

Only when **all** hold: 3+ genuinely independent vertical slices (a whole screen or flow each), each a substantial multi-file unit, and no two slices edit the same files. Otherwise one agent executes sequentially. Decomposition is an optimisation, not a default.

## Shape

* Split by vertical slices (screen/flow end to end), never by layers.
* **Contracts first**: shared types, engine APIs, zod schemas, query key and options factories, shared `shared/ui` pieces are created by one executor before any parallel work starts. Subagents must not invent or change shared contracts.
* **Reference slice first** when slices share a pattern; its reviewed result is named in the other briefs.
* **Exclusive file ownership** per subagent; otherwise use worktree isolation or go sequential.

## Developer approval

Before any execution (including the contracts phase), present in Russian: each subagent (role, slice, what it does), what the orchestrator does itself, and the order. Ask «Запускаю выполнение по этому плану?» and wait for explicit approval.

## Integration

The orchestrator merges results, resolves seams itself, runs the done checks (`08-rule-code-style.md`), and reviews the merged diff with the `code-reviewer` agent before reporting.

## Restrictions

* Clarification (`05-rule-task-clarification.md`) happens once, at the orchestrator level, before decomposition; subagents do not run their own clarification rounds with the developer — they report gaps back.
* Subagents do not expand beyond their brief.
