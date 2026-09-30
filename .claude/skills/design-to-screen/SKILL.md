---
name: design-to-screen
description: Procedure for implementing a Reckon Path screen or UI component from the design in design/*.dc.html and the spec — maps design CSS variables to spec tokens, uses the spec type scale instead of design pixel sizes, covers both themes, all four data states, RU/EN keys, and accessibility. TRIGGER when building or changing a screen, widget, or shared/ui component with a visual design. SKIP for pure logic (engine, stores, API) and for tasks not yet confirmed via clarify-task.
allowed-tools: Read, Grep, Glob, Write, Edit, Bash
---

# Design to Screen

Run only after `clarify-task` is confirmed. Rules in force: `13-rule-ui-unistyles-tokens.md`, `14-rule-animations-and-graphics.md`, `15-rule-i18n-and-accessibility.md`, `06-rule-architecture-fsd.md`.

## 1. Locate

* Spec: the screen's section in Part 4 (composition, states, actions, route), its texts in Part 5, its wireframe in Part 4 §14–§16, transitions in Part 4 §17.
* Design: section and frames from `design/README.md`. `Grep` for `data-screen-label="NN.` in the file and read only that screen's markup; look at `design/shots/` for a picture. Ignore section 15 (draft archive).

## 2. Extract, then translate — never copy

| From the design | Into code |
| --- | --- |
| CSS variable (`var(--surface)`, `--text2`, `--cyan`) | Spec semantic token (`bg.surface`, `text.secondary`, `accent.cyan`) — Part 3 §2 |
| Raw color with no variable | Find the matching spec token; none → question |
| `font: 800 13px Unbounded` | Type-scale variant from Part 3 §3.1 by role (e.g. `display.m`), not the px value |
| padding / gap / radius px | Nearest spec token (`space.*`, `radius.*`) by the role described in Part 3 §4; ambiguous → question |
| Shadows / glows | `elevation.*` / `glow.*` tokens |
| Unicode glyphs, emoji icons | SVG icon components |
| Hard-coded RU/EN text (`data-l="ru"` / `data-l="en"`) | i18n keys from Part 5; design text ≠ Part 5 text → Part 5 wins, report the difference |

Missing tokens, texts, or states are collected and asked in one batch — do not guess. For a missing or inconsistent piece of the design, check how the prototype (`../peleng`, `../arena`, read-only) handles it and offer that as an option in the question.

## 3. Build

1. Reuse `shared/ui` components; add new ones there only if generic, with Unistyles `variants` matching the design-system component (Part 3 §7).
2. Place code per FSD: route file (thin) → `screens/<name>` → widgets → features → entities.
3. Implement all states: loading skeleton, empty, error with retry, offline (Part 1 §8.2), plus screen-specific states from Part 4.
4. Both themes; RU and EN; 130% font; 360 pt and 430 pt widths.
5. Accessibility labels and roles on every interactive element.
6. Animations only via motion tokens and the tool mapped in rule 14.

## 4. Verify

* Compare against the design screenshot in both themes; list every intentional deviation (spec-driven sizes, contrast-corrected colors) in the report.
* Tests for any logic introduced (hooks, mappings, stores); RNTL tests for key interactive components.
* Done checks from `08-rule-code-style.md`.
* Report in Russian: what was built, spec sections and design screens covered, deviations with reasons, open questions.
