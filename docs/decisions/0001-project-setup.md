# 0001. Project setup

Date: 2026-09-30. Asked by: Claude Code configuration setup. Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Product name: PELENGE (spec) or Reckon Path (design, repo)? | **Reckon Path** is final; PELENGE was the working title. Use Reckon Path in code, packages, and configuration. The spec text is not edited. | Part 1 §1 |
| 2 | Monorepo (pnpm + Turborepo) now, or a single app? | **Single Expo app** in this repository for now. The engine is still isolated in `packages/engine` (alias `@reckon-path/engine`) with no React/RN/Expo imports, so moving to a monorepo later is cheap. | Part 8 §5.1 |
| 3 | What does this repository contain? | **Mobile client only.** Go backend and admin panel live elsewhere and are out of scope. | Part 8 §5, Part 9, Part 10 |
| 4 | File naming: spec examples (`Button.styles.ts`) or kebab-case? | **kebab-case** for all files and folders. | Part 8 §3.3 examples are illustrative only |
| 5 | Source priority | Decisions → spec Part 6 (engine) → rest of the spec → design. On any conflict — stop and ask. | Part 1 intro |
| 6 | Split the spec into parts for targeted reading? | Yes: `docs/spec/NN-*.md` + `docs/spec/README.md`; `PELENGE_TZ.md` stays as the original. | — |
| 7 | Git conventions (branches, tracker ids)? | **No git rule for now** — there is no task tracker yet. | — |
| 8 | Language | Communication with the developer in Russian; rules and agent docs in English; code identifiers and test names in English. | — |

## Consequences

* Package names: `@reckon-path/engine` (and later `@reckon-path/*`) instead of `@pelenge/*` from the spec.
* Deep-link scheme and domain (spec: `pelenge://`, `pelenge.app`) are **not decided** — ask before implementing deep links, bundle IDs, or anything that embeds a domain.
* Package manager is npm (the repository has `package-lock.json`); the spec's pnpm workspaces apply only after a move to a monorepo.
* **Resolved by 0002 #1** (routes in `src/app/`, FSD app layer in `src/application/`). Background: spec Part 8 §5.2 puts Expo Router routes in the root `app/` and the FSD app layer in `src/app/`. This does not work with Expo Router: "The src/app directory takes higher precedence than the root app directory. Only the src/app directory will be used if you have both", and customizing the routes root is "highly discouraged" (docs.expo.dev/router/reference/src-directory). Proposed: routes stay in `src/app/` (Expo default), the FSD app layer (providers, bootstrap) moves to `src/application/`. Confirmed by the developer.
