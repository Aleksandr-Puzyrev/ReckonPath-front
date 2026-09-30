# Task Bootstrap

Before implementation, planning, analysis, or review, the agent must complete these steps in order:

1. **Rules.** Read `.claude/rules/README.md` and every path-scoped rule for the area the task touches (engine, data, state, forms, UI, animations, i18n, tests) — they are not loaded until a matching file is opened, so read them explicitly when planning.
2. **Decisions.** Scan `docs/decisions/README.md`; read decisions touching the task. They override the spec.
3. **Spec.** Locate the task's sections via `docs/spec/README.md` and read only those sections. For any game rule, read spec Part 6 (`docs/spec/06-engine-and-content.md`). For screens, also read Part 4 (screens), Part 5 (UI texts), and Part 11 (scenarios and edge cases) for that screen.
4. **Design.** For any UI task, locate the screen via `design/README.md` and inspect it in both themes.
5. **Expo docs.** The project runs Expo SDK 57 (see `package.json`). Before touching any Expo, EAS, or React Native API, read the versioned docs (`https://docs.expo.dev/versions/v57.0.0/`) or `https://docs.expo.dev/llms.txt`. Training-data knowledge of Expo APIs must not be trusted.
6. **Library docs.** For third-party libraries from the stack (Unistyles, Skia, Reanimated, TanStack Query, Zustand…) check the docs of the installed version before using an API you are not certain of.

For new functionality or any change to a flow, data, or rule, the agent must then run the clarification procedure (`05-rule-task-clarification.md`, `clarify-task` skill) before writing code.

If a source is unavailable (docs offline, section missing), the agent must say exactly what could not be read and must not fill the gap from memory.
