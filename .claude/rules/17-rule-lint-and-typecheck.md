---
paths:
  - "eslint.config.*"
  - "tsconfig.json"
  - "jest.config.*"
  - ".prettierrc"
  - "package.json"
  - "app.json"
  - "app.config.ts"
  - ".claude/settings.json"
  - ".claude/scripts/**"
---

# Linting, Type Checking, Formatting, Pre-Commit Checks

## Commands

| Command | What |
| --- | --- |
| `npm run lint` | ESLint over the whole project (`expo lint .`; plain `expo lint` skips `packages/`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format:check` / `npm run format` | Prettier check / write (`.prettierrc`) |
| `npm test` | Jest, projects `app` and `engine` (`jest.config.js`) |
| `npx expo-doctor` | Dependency and config diagnostics after dependency changes |

The package manager is npm; Node per `.nvmrc`. Dependencies are added only via `npx expo install <package>`.

## Enforcement

* Agent commits: the Claude Code `PreToolUse` hook (`.claude/settings.json` → `.claude/scripts/pre-commit-check.js`) runs `npm run lint`, `typecheck`, `format:check`, and `test` before every `git commit`, and denies the commit on failure.
* Human commits: husky `pre-commit` (switches Node via nvm when available) → `lint-staged` (`eslint --fix` + `prettier --write` on staged files).
* Neither replaces running the done checks at the end of a task (`08-rule-code-style.md`).

## What the linter enforces (`eslint.config.js`)

| Rule | Checks |
| --- | --- |
| `eslint-config-expo` | Expo/React/TypeScript base, `react-hooks` v7 including React Compiler rules |
| `boundaries/dependencies` | FSD import direction and no cross-slice imports within a layer (rule 06) |
| `no-restricted-imports` / `-properties` / `-globals` in `packages/engine` | No React/RN/Expo, no `Math.random`, `Date.now`, `fetch` (rule 09) |
| `react-native/no-color-literals` + `no-restricted-syntax` | No color literals outside `src/shared/theme` (rule 13) |
| `i18next/no-literal-string` (`jsx-only`) | No raw JSX text and no literal `accessibilityLabel`/`accessibilityHint`/`placeholder`/`title`/`label` (rule 15) |
| `check-file/*` | kebab-case files and folders outside `src/app` (rule 07) |
| `@typescript-eslint/*` | No `any`, no `!`, `import type` (rule 08) |
| `import/order`, `no-console`, `import/no-anonymous-default-export` | Rule 08 |
| `eslint-config-prettier` | Disables formatting rules that conflict with Prettier |

Not enforced by lint: accessibility props — `eslint-plugin-react-native-a11y` supports only ESLint ≤ 8; rule 15 is checked in review. The Jest coverage thresholds of rule 16 are added with the first engine and store code.

## Policy

* Fix the error, do not suppress it. `eslint-disable-next-line` only as a last resort, targeted, with a reason; whole-file disables are forbidden.
* `@ts-ignore` is forbidden; `@ts-expect-error` only with a reason.
* Do not change lint, compiler, or formatter config to make your own code pass — config changes are a separate, agreed decision.
* A new lint rule lands together with fixes for all existing violations.
* After adding a new FSD layer folder or alias, keep `tsconfig.json` paths and `boundaries/elements` in sync.
* Alias resolution for `boundaries` relies on `eslint-import-resolver-typescript`, which comes transitively from `eslint-config-expo` and is intentionally not declared (`docs/decisions/0003-infrastructure-setup.md` #11). After an Expo/ESLint upgrade, verify that a cross-slice alias import is still reported; if not, tell the developer.
