---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "packages/engine/vectors/**"
  - "e2e/**"
  - "jest.config.*"
---

# Testing

Source: spec Part 8 §12.3, Part 1 §12.3, Part 11 (scenarios and edge cases).

## Stack

| Tool | Purpose |
| --- | --- |
| Jest + `jest-expo` | Unit and integration tests (engine and app) |
| `@testing-library/react-native` | Components and hooks |
| `msw` | API mocking at the network level |
| Maestro | E2E flows on iOS and Android |
| Storybook (on-device) | Component catalogue and screenshot comparison |

Jest and RNTL are configured (`jest.config.js`): project `app` (`jest-expo`, tests under `src/`) and project `engine` (Node environment, tests under `packages/engine/`). `npm test` runs both with `--passWithNoTests`. The `app` project loads `react-native-unistyles/mocks` and the theme configuration (`src/shared/theme/unistyles.ts`) in `setupFiles`, and maps `*.svg` to `jest/svg-mock.js`. Tests that check texts set the language explicitly (`i18n.changeLanguage`). msw, Maestro, and Storybook are installed by the first task that needs them.

## Coverage targets (Part 8 §12.3)

| Area | Target |
| --- | --- |
| `@reckon-path/engine` (rules, bomb, validator, bot, daily, codes) | ≥ 95% lines + all shared vectors (`09-rule-game-engine.md`) |
| Stores and features (game session, match scenarios from Part 11, outbox, auth refresh) | ≥ 80% |
| UI kit components | Key components via RNTL + Storybook story per component and state |
| E2E (Maestro) | Onboarding, level (win / lose / continue with mocked ad), daily, purchase, match vs bot, offline → online |

Always mandatory: engine code, utilities, zod schemas, stores (actions, `reset`, migrations), data mappings, board hit-test and geometry. A new file of these kinds without tests means the task is not done.

Not tested: generated API code, third-party library internals, trivial wrappers without logic.

## Scenarios from the spec

Where spec Part 11 or the Part 12 epics list scenarios or acceptance criteria for the feature being built, each one becomes at least one test. Tests assert spec behaviour, not the implementation's current behaviour.

## Writing rules

* Tests next to the file under test: `resolve-tap.ts` → `resolve-tap.test.ts`. Shared helpers in `test-utils/` of the slice (or `shared/test-utils/`). E2E flows in `e2e/` at the repository root.
* Arrange / Act / Assert; one behaviour per `test`.
* Names in English, describing behaviour: `test("loses when a bomb is hit on the last move")`. `describe` = the entity under test.
* Test public behaviour, not internals. No snapshot tests.
* Deterministic: no real network, time mocked, randomness seeded, no order dependence.
* A failing test is a blocker: never `skip`, delete, or weaken it to get green — fix the code, or ask if the spec is ambiguous.
* A bug fix starts with a failing test that reproduces it.
