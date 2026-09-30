---
name: decompose-task
description: Procedure for splitting a large, already clarified Reckon Path task into vertical slices executed by parallel subagents, per 18-rule-task-orchestration.md. TRIGGER when a confirmed task spans 3+ independent screens/flows, each a multi-file unit (e.g. profile + friends + settings screens). SKIP for single-slice or small tasks, and for unclarified tasks — run clarify-task first.
allowed-tools: Read, Glob, Grep, Agent
---

# Decompose Task

Boundaries are in `.claude/rules/18-rule-task-orchestration.md` — read it first.

## Procedure

1. **Qualify.** Check the criteria in rule 18. If any fails — say why and execute sequentially. Clarification must already be confirmed.
2. **Slice.** Cut into vertical slices (screen/flow end to end). For each: goal, non-scope, owned files. No file in two slices; shared files go to the contracts phase or integration.
3. **Present and wait.** In Russian: every subagent (e.g. «Агент 2 — экран друзей: список, заявки, состояния, тесты»), what the orchestrator does itself (contracts, reference slice, integration), the order. Ask «Запускаю выполнение по этому плану?» and wait for explicit approval; re-present after changes.
4. **Contracts phase (sequential).** Create shared types, engine APIs, zod schemas, `<entity>Keys` and query/mutation factories, shared `shared/ui` pieces. Run `npx tsc --noEmit` before continuing.
5. **Reference slice** (when slices share a pattern): one agent completes the first slice fully; review it; name it in the other briefs.
6. **Brief and launch.** Fill `templates/subtask-brief-template.md` per slice — contracts pasted in verbatim, owned files, relevant rules, spec sections, design screens, decisions. Launch in parallel.
7. **Integrate and verify.** Merge and fix seams yourself; run the done checks (`08-rule-code-style.md`); review the merged diff with the `code-reviewer` agent; report in Russian.

## Failure handling

* Off-brief or broken result — fix small seams yourself; relaunch with a corrected brief when the miss is structural. Never count an unfinished slice as done.
* Missing contract work reported by a subagent belongs to the orchestrator.
* Two agents need the same file — stop the later one, resolve ownership, relaunch.
* A subagent reports a spec gap — collect such gaps and ask the developer once; do not let subagents decide.
