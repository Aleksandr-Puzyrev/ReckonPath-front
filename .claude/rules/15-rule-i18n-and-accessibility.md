---
paths:
  - "src/**/*.tsx"
  - "src/shared/i18n/**"
---

# Localization and Accessibility

Source: spec Part 8 §11, Part 5 (UI texts), Part 3 §11, Part 1 §8.5.

## Localization

* Languages `ru` and `en`, fallback `en`; initial language from `expo-localization`, then from settings. Switching language needs no restart.
* No user-visible string literals in JSX or logic — only `t('<namespace>.<key>')`. Namespaces by section: `home`, `play`, `arena`, `shop`, `errors`, `push`, … (Part 8 §11).
* Keys and texts come from spec Part 5. A string the screen needs but Part 5 does not provide is a question for the developer — never write your own copy.
* Every key exists in both RU and EN. Plurals via `Intl.PluralRules` keys (`_one`, `_few`, `_many`, `_other`).
* Numbers, dates, and timers via `Intl` / `date-fns` with the current locale; tone and grammar rules per Part 5 §1.
* Server-provided texts (items, events, banners) are displayed as received.
* Layouts must not truncate the longer language (usually RU) on a 360 pt screen.

## Accessibility

* Every interactive element has `accessibilityRole`, `accessibilityLabel` (i18n), and `accessibilityState` where relevant.
* Board cells are announced as in Part 1 §8.5 («C4, ручей, пеленг 3»; fences by side). Game events are announced via `AccessibilityInfo.announceForAccessibility` («Сигнал найден», «Твой ход»).
* Meaning is never conveyed by color alone (HOT/WARM/COLD also as number and outline thickness).
* Text contrast ≥ 4.5:1 in both themes (tokens already satisfy this — do not bypass them).
* `maxFontSizeMultiplier` per text style: 1.3 for body/title/caption, 1.0 for display, board numbers, and tab bar.
* Reduced motion is respected (`14-rule-animations-and-graphics.md`).
* Live PvP gets no extra turn time for accessibility (Part 1 §8.5) — this is intentional.
