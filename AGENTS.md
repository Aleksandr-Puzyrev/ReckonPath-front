# Reckon Path — mobile client

Reckon Path is a turn-based logic game for iOS and Android: the player finds hidden targets on a grid by bearing (shortest-path distance). This repository is the Expo / React Native client and its pure TypeScript game engine. The Go backend and the admin panel are separate and out of scope.

Always communicate with the developer in Russian — questions, plans, reports. Code identifiers, commit messages, and test names are in English.

## Work only from the requirements — never invent

* Requirements live in `docs/` — start at `docs/README.md` (spec index, design index, decisions, source priority).
* Anything the spec, design, or decisions do not state is a question for the developer, not an assumption. Before coding a feature, run the `clarify-task` skill and wait for explicit confirmation.
* The spec calls the product «PELENGE» — the former working title; the product name is Reckon Path.

## Project rules

Mandatory rules live in `.claude/rules/` (index: `.claude/rules/README.md`). General rules load every session; layer rules (engine, data, state, forms, UI, animations, i18n, tests) load when their files are touched — read them explicitly when planning. Project skills: `.claude/skills/README.md`. Review agent: `.claude/agents/code-reviewer.md`.

## Expo has changed — do not trust your training data

The project runs Expo SDK 57. Expo ships breaking changes every SDK release. Before writing code that touches an Expo, EAS, or React Native API:

1. Confirm the `expo` major version in `package.json`.
2. Read the versioned docs: `https://docs.expo.dev/versions/v57.0.0/`.
3. For anything else, use `https://docs.expo.dev/llms.txt` and follow its links; never answer from memory.

## Commands

The package manager is npm (`package-lock.json`). Node is pinned in `.nvmrc` (22.23.0). The agent's shell may start on another default Node, so prefix every Node/npm/npx command with `source ~/.nvm/nvm.sh && nvm use >/dev/null && …`.

```bash
npx expo install <package>  # ALWAYS instead of npm install <package> — resolves SDK-compatible versions
npx expo start              # dev server
npm run lint                # ESLint over the whole project (expo lint .)
npm run typecheck           # tsc --noEmit
npm test                    # Jest: projects "app" (jest-expo) and "engine" (node)
npm run format              # Prettier write; format:check to verify
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint, typecheck, format check, and tests before declaring any task done. The Claude commit hook enforces them; husky + lint-staged format staged files on human commits.

## Navigation and native code

* Expo Router; routes live in `src/app/` (thin route files only). The rest of the code follows Feature-Sliced Design — see `.claude/rules/06-rule-architecture-fsd.md`. Import `Link`, `router`, `useLocalSearchParams` from `expo-router`. Docs: https://docs.expo.dev/router/introduction.md
* `ios/` and `android/` are generated (Continuous Native Generation) — never create or edit them; configure native behaviour in app config and config plugins.
* Libraries with native code need a development build (`npx expo run:ios|android` or `npx eas-cli@latest build --profile development`); Expo Go is not enough.

## Building with EAS

EAS builds, signs, submits, and ships OTA updates (`eas build`, `eas submit`, `eas update`). Run it as `npx eas-cli@latest <command>`. Profiles and channels are defined in spec Part 8 §12.1. Docs: https://docs.expo.dev/eas/index.md
