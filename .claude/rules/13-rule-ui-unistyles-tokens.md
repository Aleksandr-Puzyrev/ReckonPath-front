---
paths:
  - "src/**/ui/**"
  - "src/screens/**"
  - "src/widgets/**"
  - "src/shared/theme/**"
  - "src/**/*-styles.ts"
---

# UI and Styles: Unistyles 3 + Design Tokens

Source: spec Part 3 (design system), Part 4 (screens), Part 8 §3 (styles), Part 1 §8 (UI/UX). The design in `design/` is the main reference for screens; the spec defines token names, scale, and rules. Where the design has gaps, consult the prototypes and ask (`05-rule-task-clarification.md`).

Unistyles 3 is the only styling system (`docs/decisions/0004-ui-foundation.md` #13): no Tailwind/NativeWind, Tamagui, Restyle, or styled-components, and no `StyleSheet.create` from `react-native` (its constants such as `absoluteFill` are fine).

## Tokens are the only source of style values

* Colors, gradients, spacing, radii, elevation, typography, sizes, durations — only from theme tokens. Color literals, raw spacing, and raw font sizes in components are forbidden (linted once lint is configured).
* Token names are the spec's semantic names (Part 3 §2–§4, §8): `theme.colors.bg.surface`, `theme.colors.text.secondary`, `theme.space[5]`, `theme.radius.m`, `elevation.1`, `gradient.primary`.
* Tokens are hand-written TypeScript in `src/shared/theme/` (light and dark themes, typography, motion) with values from spec Part 3 tables. There is no Figma: the Figma → Style Dictionary pipeline of Part 3 §12.1 and Part 8 §3.2 does not apply (`docs/decisions/0002-setup-follow-ups.md` #2).
* The design's CSS variables (`--bg`, `--text2`, `--cyan`…) are mapped onto spec tokens, never used as names.
* A value seen in the design but absent from spec tokens is a question to the developer, not a new token or a literal.
* Game-board skins are Skia data (`skin.json`), not part of the Unistyles theme (Part 8 §3.4).

## Themes

* Light and dark, following the system theme (`docs/decisions/0004-ui-foundation.md` #2 supersedes Part 1 §1.2) through React Native `Appearance` and `useSystemTheme` in `shared/theme`, not Unistyles `adaptiveThemes`, which misses switches on Android (`docs/decisions/0010-play-screen.md` #17). Manual choice via `UnistylesRuntime.setTheme`, persisted in `useSettingsStore`, comes with the settings screen.
* Project tokens outside spec Part 3 exist only by decision: `bg.glass` (0004 #3).
* Status bar and Android system bar follow the theme.
* Every screen and component is checked in both themes.

## Components

* Styles via `StyleSheet.create(theme => …)` from `react-native-unistyles` in `<component>-styles.ts`; component variants via Unistyles `variants` matching the design-system variants (Part 3 §7).
* Text only through `shared/ui` `Text` with `variant` from the type scale (Part 3 §3.1: `display.xl` … `number.timer`). Design font sizes are preview scale and are not used (Part 1 §8.3, Part 3 §3.1).
* Gradients only through `shared/ui/gradient` with token names; shadows via `boxShadow` from `elevation.*` tokens.
* Touch targets ≥ 44×44 pt (board cells on 9×9 are the documented exception). Sizes of standard elements from Part 3 §4.5.
* Numbers that change on screen use tabular figures; thousands separators per locale (Part 3 §3.2).
* Icons are SVG components (`react-native-svg`) with `currentColor`; no Unicode symbols from the concept (Part 1 §8.3).
* Images via `expo-image` with explicit size; lists via FlashList; bottom sheets via `@gorhom/bottom-sheet`.
* Before creating a component, check `shared/ui` and the component catalogue in Part 3 §7.

## Screen states

Every screen with server data implements the four states from Part 1 §8.2: loading (skeleton shaped like the content; cached data shown and refreshed silently), empty (explanation + action), error (reason + "Повторить" + small technical code), offline (banner; read-only cache where the spec says so). Skeleton components mirror the real layout and contain no logic.

Toasts, bottom sheets, and centred dialogs are used exactly as Part 1 §8.2 prescribes (dialogs only for irreversible actions). The pop-up queue at launch follows Part 1 §8.2.

## Layout

* Phones from 360 pt width; on tablets a 470 pt centred column (Part 1 §1.2). Portrait only.
* Safe areas via `react-native-safe-area-context`. Screen frames per Part 4 §1 (tab-bar screen, nested screen, full-screen game).
* Verify on 360×780 and 430×932 and with 130% system font (Part 3 §12.3).
