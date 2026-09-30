# 0003. Infrastructure setup (stage 0)

Date: 2026-09-30. Asked by: infrastructure task (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | What the app shows after the create-expo-app demo is removed | **An empty root screen** until the UI-foundation task. The developer's local edit of the demo `src/app/index.tsx` is discarded with the demo. | — |
| 2 | Web support from the template | **Not needed.** Remove `react-native-web`, `react-dom`, `*.web.tsx`, web CSS, and the `web` block of `app.json`. | Part 1 §1.2 (iOS, Android) |
| 3 | Template packages outside the spec stack | Remove only what is certainly not needed: **`@expo/ui`** and **`expo-symbols`** (the spec requires SVG icons and its own design system). **Keep `expo-web-browser`** (settings link to the privacy policy and terms, Part 4 §12.1 — opening method not specified) and **`expo-glass-effect`** (glass for header/tab bar/sheets, Part 2 — may be useful beside `expo-blur`). | Part 1 §8.3, Part 8 §2.1 |
| 4 | Dev packages for tooling | Approved: `jest`, `jest-expo`, `@testing-library/react-native`, `@types/jest`, `prettier`, `eslint-config-prettier`, `eslint-plugin-boundaries`, `eslint-plugin-check-file`, `eslint-plugin-i18next`, `eslint-plugin-react-native`, `eslint-plugin-react-native-a11y` (if compatible with ESLint 9), `husky`, `lint-staged`. | Part 8 §2.5 |
| 5 | Formatting | **Double quotes and semicolons** (Prettier), trailing commas. | — |
| 6 | Out of scope now | CI (no git remote yet), EAS config, Storybook, Maestro, msw, Unistyles/theme/i18n (next task), `app.json` identity (name, icons, splash, scheme). | Part 12 §2 stage 0 |
| 7 | `packages/engine` | Shell only in this task: folder, alias `@reckon-path/engine`, lint ban on React/RN/Expo imports, separate Jest project. Rules and vectors come in stage 1. | Part 6, Part 8 §1.1, §6.2 |
| 8 | Empty FSD layer folders | Not created; layers appear with their first slice. Lint and aliases know them in advance. | — |
| 9 | Jest with no tests yet | `--passWithNoTests`; coverage thresholds (engine ≥ 95%, stores/features ≥ 80%) are added with the first code in those folders. | Part 8 §12.3 |
| 11 | Declare `eslint-import-resolver-typescript` explicitly (it resolves path aliases for `boundaries`, currently transitive via `eslint-config-expo`)? | **No** — stays transitive. If an Expo update drops it, FSD boundary checks on alias imports stop working; restore it then. | — |
| 12 | Template patch mismatches reported by `expo-doctor` | **Update** via `npx expo install --fix`: `expo` 57.0.26, `expo-constants` 57.0.20, `expo-router` 57.0.24; doctor 21/21. | — |
| 10 | Demo assets | **Delete** `react-logo*`, `expo-badge*`, `expo-logo`, `tutorial-web`, `logo-glow`, `tabIcons/`, `favicon`. Keep the icon and splash assets referenced by `app.json`. | — |

## Consequences

* `.claude/rules/08-rule-code-style.md` gains a Formatting section (double quotes, semicolons, trailing commas, Prettier).
* `eslint-plugin-react-native-a11y` was **not installed**: it supports only ESLint ≤ 8 (peer range `^3 … ^8`), the project runs ESLint 9. Accessibility (rule 15) is checked in review until a compatible plugin exists.
* Prettier is run as a separate check (`format:check`) instead of through ESLint, since `eslint-plugin-prettier` was not in the approved list.
