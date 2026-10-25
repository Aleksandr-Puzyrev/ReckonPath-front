---
name: check-backend
description: Read-only audit of the Reckon Path Go backend (../reckon-path-backend) against the spec, the design, the decisions, and the client's implementation — finds every mismatch in endpoints, fields, types, naming, error codes, rules, and numbers, and records each with "how it should be" in docs/backend-discrepancies.md. TRIGGER when a task consumes a backend entity (endpoint, WS message, config, rule), when the developer asks to compare or check the backend, or before replacing a mock with the real server. SKIP for tasks that touch no server data.
allowed-tools: Read, Grep, Glob, Write, Edit, Bash
---

# Check Backend

Implements the "Backend repository" section of `.claude/rules/03-rule-scope-boundaries.md`. The backend is **read-only** and is **not a requirement source**: it is checked against the requirements, never the other way round.

## Hard limits

* Never create, edit, move, or delete anything in `../reckon-path-backend`. No `git` commands that change it (commit, checkout, stash, pull, reset), no `make`, `go generate`, `go mod tidy`, migrations, `docker compose`, scripts, or servers started from it.
* Read-only commands only: `ls`, `cat`/`sed -n`, `grep`/`rg`, `find`, `git log`, `git show`, `git diff` (read).
* Never open `.env` or other secret files; `.env.example` is fine. Never copy secrets, keys, or credentials into this repository or the chat.
* Never change the client, `contracts/`, or the spec to match the backend on your own — a mismatch is reported, the developer decides.

## 1. Scope the entity

Name what is checked (for example "auth", "profile", "levels", "`GET /me`", "`match.tap`"). Find it in:

* the backend: `docs/swagger.yaml` (generated from Go annotations), handlers and DTOs in `internal/`, `migrations/`, `cmd/`; `git log` for what changed recently;
* the requirements: decisions → spec Part 7 (API), Part 6 (rules, numbers), Part 9–10 (backend/admin, context), Part 5 (error texts) → design;
* the client: `contracts/openapi.yaml`, `src/shared/api/generated/`, `src/shared/api/mocks/`, the entity's `api/` and `model/`, `src/shared/ws/`.

## 2. Compare

For every endpoint, message, and field check: path and method, auth, request and response shape, field names and casing, types and nullability, enums and unions, units (ms vs s, coins vs cents), defaults, pagination, error codes and HTTP statuses, idempotency, headers (spec Part 8 §9.1), and game rules and numbers (Part 6). Also note what the backend lacks that the spec or the client needs, and what it has that no source describes.

## 3. Record

Append to `docs/backend-discrepancies.md`, one row per mismatch, in the table of the entity's section (create the section if missing):

| # | Where in the backend | What the backend does | What the sources say | How it should be | Client impact | Severity |

* "Where" — file:line or endpoint/field, so the backend team can find it.
* "What the sources say" — cite them: `Part 7 §3.2`, `design 19.3`, `decision 0033 #4`, `contracts/openapi.yaml`, the client file.
* "How it should be" — the concrete correct shape or behaviour according to the sources. If the sources disagree among themselves or are silent, write «нужно решение разработчика» and list the options instead of choosing.
* "Client impact" — what breaks or must change in the client if the backend stays as is.
* Mark a resolved row `✅ <date>`; do not delete it.

## 4. Report

In Russian: what was checked (entity, backend commit `git log -1 --format=%h`), how many mismatches by severity — 🔴 breaks the client or a game rule, 🟡 contract or naming drift, ⚪ cosmetic or missing docs — the 🔴 ones listed in the chat, the rest by reference to the register, and the questions that need the developer's decision.
