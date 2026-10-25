# Scope Boundaries

## Project scope: mobile client only

This repository is the Reckon Path mobile client (Expo / React Native) and its game engine (`packages/engine`). The Go backend and the admin panel live elsewhere (`docs/decisions/0001-project-setup.md`).

* In scope: `src/`, `packages/`, `assets/`, `modules/` (own Expo modules), app configuration, tests, `docs/`, `.claude/`.
* Out of scope: backend code, database, server-side services, admin panel. The agent must not add server endpoints, server logic, or admin code anywhere in this repository.
* The client consumes the backend only through the API contract (spec Part 7) and the generated client (`10-rule-data-layer-tanstack-query.md`). A missing or unclear endpoint is a question for the developer, not something to design.
* Reading the spec's backend/admin parts (Parts 9–10) for context is allowed.

## Backend repository: read-only

The Go backend lives at `../reckon-path-backend` (`/Users/aleksandr/Desktop/Aleksandr/ShoveArena/reckon-path-backend`). It is partly implemented.

* The agent may only read it: code, `docs/swagger.yaml`, migrations, `git log` / `git show`. It must never create, edit, move, or delete files there, run state-changing `git` commands, `make`, generators, migrations, `docker compose`, scripts, or servers from it.
* The agent must not open `.env` or other secret files there, and must not copy secrets into this repository or the chat.
* The backend is **not a requirement source** (`00-rule-governance.md`). Where it differs from the decisions, the spec, the design, or the client's implementation, the agent must not adapt the client, `contracts/`, or the spec silently: it records the mismatch with how it should be in `docs/backend-discrepancies.md` (`check-backend` skill) and asks the developer.

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
