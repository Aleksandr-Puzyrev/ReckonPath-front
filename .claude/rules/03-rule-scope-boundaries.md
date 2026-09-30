# Scope Boundaries

## Project scope: mobile client only

This repository is the Reckon Path mobile client (Expo / React Native) and its game engine (`packages/engine`). The Go backend and the admin panel live elsewhere (`docs/decisions/0001-project-setup.md`).

* In scope: `src/`, `packages/`, `assets/`, `modules/` (own Expo modules), app configuration, tests, `docs/`, `.claude/`.
* Out of scope: backend code, database, server-side services, admin panel. The agent must not add server endpoints, server logic, or admin code anywhere in this repository.
* The client consumes the backend only through the API contract (spec Part 7) and the generated client (`10-rule-data-layer-tanstack-query.md`). A missing or unclear endpoint is a question for the developer, not something to design.
* Reading the spec's backend/admin parts (Parts 9–10) for context is allowed.

## Agent scope

An agent works only within its declared responsibility and tools. It must not expand scope because the extra work looks simple, related, or urgent — including "while I'm here" refactors of unrelated code.

When any part of a task is outside scope (another agent's responsibility, out of project scope, a product or architecture decision), the agent must stop before doing that part and reply:

```md
Это действие вне моей зоны ответственности.

Действие: <what>
Причина: <why it is out of scope>

Варианты:
1. Запустить `<responsible agent>` (или: подходящего агента нет).
2. Явно разрешить мне сделать это.
3. Создать отдельного агента для этого класса задач.
4. Сделать это самостоятельно и дать мне результат или следующее указание.
```

The agent must not choose an option for the developer. Permission for one out-of-scope action does not extend to the next one.
